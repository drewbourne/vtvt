import { ServiceOperation, ServiceRpcSubject } from "@fbt/service";
import { Logger } from "@logtape/logtape";
import {
  Attributes,
  context,
  Context,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanStatusCode,
  TextMapGetter,
  TextMapSetter,
  trace,
  Tracer,
} from "@opentelemetry/api";
import {
  NatsConnection,
  MsgHdrs,
  headers as createHeaders,
  Msg,
  Payload,
  PublishOptions,
  RequestManyOptions,
  RequestOptions,
  Subscription,
  SubscriptionOptions,
  RequestStrategy,
  Service,
} from "nats";
import * as z from "zod";

const defaultTracer = trace.getTracer("@fbt/nats");

const natsHeaderSetter: TextMapSetter<MsgHdrs> = {
  set(carrier, key, value) {
    carrier.set(key, value);
  },
};

const natsHeaderGetter: TextMapGetter<MsgHdrs> = {
  keys(carrier) {
    return carrier.keys();
  },
  get(carrier, key) {
    return carrier.get(key) || undefined;
  },
};

function messagingAttributes(
  subject: string,
  operationType: "publish" | "request" | "receive",
): Attributes {
  return {
    "messaging.system": "nats",
    "messaging.destination.name": subject,
    "messaging.operation.type": operationType,
  };
}

// Injects the active trace context into `headers` (creating one if not
// given) so it rides along with the outbound NATS message.
function injectHeaders(existing?: MsgHdrs): MsgHdrs {
  const msgHeaders = existing ?? createHeaders();
  propagation.inject(context.active(), msgHeaders, natsHeaderSetter);
  return msgHeaders;
}

// Runs `fn` inside a span, optionally rooted under `parentContext` (e.g. a
// context extracted from an inbound message) rather than the ambient one.
// Exceptions are recorded on the span and rethrown; the span always ends.
async function withSpan<T>(
  name: string,
  options: {
    tracer: Tracer;
    kind: SpanKind;
    attributes: Attributes;
    parentContext?: Context;
  },
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  const run = () =>
    options.tracer.startActiveSpan(
      name,
      { kind: options.kind, attributes: options.attributes },
      async (span) => {
        try {
          return await fn(span);
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          throw error;
        } finally {
          span.end();
        }
      },
    );

  return options.parentContext
    ? context.with(options.parentContext, run)
    : run();
}

export class NatsService {
  private nc: NatsConnection | null = null;

  // private js: Jetstream
  // private jsm: JetstreamManager

  constructor(
    private logger: Logger,
    private tracer: Tracer,
    private natsConnection: Promise<NatsConnection>,
  ) {}

  async connect(): Promise<NatsConnection> {
    this.nc = await this.natsConnection;
    if (!this.nc) throw new Error(`Unable to connect to NATS`);
    return this.nc!;
  }

  async subscribeOperation<
    Subject extends ServiceRpcSubject,
    Method extends string,
    Params extends z.ZodType,
    Result extends z.ZodType,
  >(
    operation: ServiceOperation<Method, Params, Result, Subject>,
    opts: SubscriptionOptions,
    handler?: (params: Params) => Promise<Result>,
  ) {
    this.subscribe(operation.subject, opts, async (msg) => {
      trace.getActiveSpan()?.setAttribute("rpc.method", operation.method);

      try {
        const data = msg.json();
        const request = operation.params.parse(data);

        // TODO pass msg? headers?
        // TODO wrap in try-catch
        // @ts-expect-error
        const res = await handler(request);
        const result = operation.result.parse(res);

        this.logger.info("handler", {
          subject: msg.subject,
          headers: msg.headers,
          request,
          result,
        });

        msg.respond(JSON.stringify(result));
      } catch (error) {
        this.logger.error(`Error invoking service`, {
          subject: operation.subject,
          method: operation.method,
          error,
        });

        throw error;
      }
    });
  }

  async subscribe(
    subject: string,
    opts: SubscriptionOptions,
    handler: (msg: Msg) => Promise<void>,
  ) {
    await this.connect();

    this.logger.info(`subscribe`, { subject, opts });

    const sub = this.nc!.subscribe(subject, opts);

    (async (sub: Subscription) => {
      for await (const msg of sub) {
        const parentContext = msg.headers
          ? propagation.extract(ROOT_CONTEXT, msg.headers, natsHeaderGetter)
          : ROOT_CONTEXT;

        await withSpan(
          `${subject} receive`,
          {
            tracer: this.tracer,
            kind: SpanKind.CONSUMER,
            attributes: messagingAttributes(subject, "receive"),
            parentContext,
          },
          async () => {
            this.logger.debug(`handler`, { subject, opts });

            try {
              await handler(msg);
            } catch (error) {
              this.logger.error({
                subject,
                opts,
                headers: msg.headers,
                error,
              });
              this.logger.error(error as Error);
              throw error;
            }
          },
        );
      }
    })(sub);
  }

  async publish(subject: string, payload?: Payload, opts?: PublishOptions) {
    await this.connect();

    return withSpan(
      `${subject} publish`,
      {
        tracer: this.tracer,
        kind: SpanKind.PRODUCER,
        attributes: messagingAttributes(subject, "publish"),
      },
      async () => {
        this.nc!.publish(subject, payload, {
          ...opts,
          headers: injectHeaders(opts?.headers),
        });
      },
    );
  }

  async requestOperation<
    Subject extends ServiceRpcSubject,
    Params extends z.ZodType,
    Result extends z.ZodType,
    Request extends object,
  >(
    request: Request,
    operation: Omit<
      ServiceOperation<string, Params, Result, Subject>,
      "method"
    >,
    opts?: RequestOptions,
  ) {
    return withSpan(
      `${operation.subject} requestOperation`,
      {
        tracer: this.tracer,
        kind: SpanKind.CLIENT,
        attributes: messagingAttributes(operation.subject, "request"),
      },
      async () => {
        const data = operation.params.parse(request);
        const msg = JSON.stringify(data);

        const res = await this.request(operation.subject, msg, opts);
        const result = operation.result.parse(res.json());

        this.logger.info("requestOperation result", {
          subject: res.subject,
          headers: res.headers,
          request,
          result,
        });

        // TODO return msg? headers?

        return result;
      },
    );
  }

  async request(subject: string, payload?: Payload, opts?: RequestOptions) {
    await this.connect();

    return withSpan(
      `${subject} request`,
      {
        tracer: this.tracer,
        kind: SpanKind.CLIENT,
        attributes: messagingAttributes(subject, "request"),
      },
      () =>
        this.nc!.request(subject, payload, {
          timeout: 1000,
          ...opts,
          headers: injectHeaders(opts?.headers),
        }),
    );
  }

  async requestManyOperation<
    Subject extends ServiceRpcSubject,
    Params extends z.ZodType,
    Result extends z.ZodType,
    Request extends object,
  >(
    request: Request,
    operation: Omit<
      ServiceOperation<string, Params, Result, Subject>,
      "method"
    >,
    opts?: RequestManyOptions,
  ) {
    return withSpan(
      `${operation.subject} requestManyOperation`,
      {
        tracer: this.tracer,
        kind: SpanKind.CLIENT,
        attributes: messagingAttributes(operation.subject, "request"),
      },
      async () => {
        const data = operation.params.parse(request);
        const msg = JSON.stringify(data);

        const responses = await this.requestMany(operation.subject, msg, opts);
        const results = [];

        for await (const res of responses) {
          const result = operation.result.parse(res.json());
          results.push(result);
        }

        return results;
      },
    );
  }

  async requestMany(
    subject: string,
    payload?: Payload,
    opts?: RequestManyOptions,
  ) {
    await this.connect();

    return withSpan(
      `${subject} requestMany`,
      {
        tracer: this.tracer,
        kind: SpanKind.CLIENT,
        attributes: messagingAttributes(subject, "request"),
      },
      () =>
        this.nc!.requestMany(subject, payload, {
          strategy: RequestStrategy.Timer,
          maxWait: 1000,
          ...opts,
          headers: injectHeaders(opts?.headers),
        }),
    );
  }

  // async addService(service: ServiceDescriptor): Promise<Service> {
  //   const nc = await this.connect();

  //   const sd = ServiceDescriptor.parse(service);

  //   const svc = await nc.services.add({
  //     name: sd.name,
  //     version: sd.version,
  //     description: sd.description,
  //     metadata: sd.metadata,
  //   });

  //   svc.stopped.then((error) => {
  //     this.logger.error(`svc.stopped`, { error });
  //   });

  //   for (const op of sd.operations) {
  //     svc.addEndpoint(op.method, {
  //       subject: op.subject,
  //       metadata: op.metadata,
  //       handler: (err, msg) => {
  //         // TODO
  //         // this.handleServiceOperationMessage(sd, operation, err, msg);
  //       },
  //     });
  //   }

  //   return svc;
  // }

  // async handleServiceOperationMessage(sd, operation, err, msg) {
  //   return this.tracer.startActiveSpan(operation.subject, async () => {});
  // }
}

// const ServiceDescriptor = z.object({
//   name: z.string(),
//   version: z.string(),
//   description: z.string(),
//   metadata: z.record(z.string(), z.string()).optional(),
//   operations: z.array(
//     z.object({
//       method: z.string(),
//       params: z.any(),
//       result: z.any(),
//       subject: z.string(),
//       metadata: z.record(z.string(), z.string()).optional(),
//     }),
//   ),
// });

// type ServiceDescriptor = z.infer<typeof ServiceDescriptor>;

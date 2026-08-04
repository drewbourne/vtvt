import { Logger } from "@logtape/logtape";
import {
  Attributes,
  Context,
  context,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  SpanStatusCode,
  TextMapGetter,
  TextMapSetter,
  Tracer,
} from "@opentelemetry/api";
import {
  headers as createHeaders,
  MsgHdrs,
  Payload,
  Msg,
  NatsError,
} from "nats";
import { v6 as uuid_v6 } from "uuid";

export type NatsTracerSpanOperation =
  | "request"
  | "publish"
  | "subscribe"
  | "receive";

export type NatsTracerSpanOptions<Options> = {
  name?: string;
  subject: string;
  payload?: Payload;
  opts?: Options;
  operation?: NatsTracerSpanOperation;
  attributes?: Attributes;
  parentContext?: Context;
};

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

export class NatsTracer {
  constructor(
    private logger: Logger,
    private tracer: Tracer,
  ) {}

  private operationToSpanKind = new Map<NatsTracerSpanOperation, SpanKind>([
    ["request", SpanKind.CLIENT],
    ["publish", SpanKind.PRODUCER],
    ["receive", SpanKind.CONSUMER],
    ["subscribe", SpanKind.CONSUMER],
  ]);

  getHeaders(existing?: MsgHdrs): MsgHdrs {
    const headers = existing ?? createHeaders();

    propagation.inject(context.active(), headers, natsHeaderSetter);

    if (!headers.has("Fbt-Msg-Id")) {
      headers.set("Fbt-Msg-Id", uuid_v6());
    }

    return headers;
  }

  getSpanOptions<Options>(
    options: NatsTracerSpanOptions<Options>,
  ): SpanOptions {
    const kind = this.operationToSpanKind.get(options.operation ?? "request");

    return {
      kind,
      attributes: {
        "messaging.system": "nats",
        "messaging.destination.name": options.subject,
        "messaging.operation.type": options.operation,
      },
    };
  }

  async withSpan<Options, Result>(
    options: NatsTracerSpanOptions<Options>,
    handler: (span: Span) => Promise<Result>,
  ) {
    const name = options.name ?? `${options.subject} ${options.operation}`;
    const opts = this.getSpanOptions(options);

    const run = () => {
      return this.tracer.startActiveSpan(name, opts, async (span) => {
        try {
          return await handler(span);
        } catch (error) {
          if (error instanceof NatsError) {
            span.setAttributes({
              "messaging.error.name": error.name,
              "messaging.error.code": error.code,
            });
            // TODO set more attributes from error
          }

          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          throw error;
        } finally {
          span.end();
        }
      });
    };

    const { payload, parentContext, ...logOptions } = options;

    if (options.parentContext) {
      this.logger.debug("withSpan run with parentContext", { ...logOptions });
      return context.with(options.parentContext, run);
    }

    this.logger.debug("withSpan run", logOptions);
    return run();
  }

  async withSpanForMsg<Options, Result>(
    { msg, ...options }: NatsTracerSpanOptions<Options> & { msg: Msg },
    handler: (span: Span) => Promise<Result>,
  ) {
    const parentContext = msg.headers
      ? propagation.extract(ROOT_CONTEXT, msg.headers, natsHeaderGetter)
      : ROOT_CONTEXT;

    this.withSpan({ ...options, parentContext }, handler);
  }
}

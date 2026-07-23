import { ServiceOperation, ServiceRpcSubject } from "@fbt/service";
import { Logger } from "@logtape/logtape";
import {
  connect,
  Msg,
  NatsConnection,
  Payload,
  PublishOptions,
  RequestManyOptions,
  RequestOptions,
  Subscription,
  SubscriptionOptions,
} from "@nats-io/transport-node";
import * as z from "zod";

export class NatsService {
  private nc: NatsConnection | null = null;

  private pendingConnection: Promise<NatsConnection> | null = null;

  constructor(private logger: Logger) {}

  private async connect() {
    if (this.pendingConnection) {
      return this.pendingConnection;
    }

    this.pendingConnection = new Promise(async (resolve, reject) => {
      try {
        this.logger.debug("connect");

        const connection = await connect();
        this.nc = connection;
        resolve(connection);
      } catch (error) {
        this.pendingConnection = null;
        this.nc = null;
        reject(error);
      }
    });

    return this.pendingConnection;
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
      try {
        const data = msg.json();
        const request = operation.params.parse(data);

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
        try {
          this.logger.debug(`handler`, {
            subject,
            opts,
          });

          await handler(msg);
        } catch (error) {
          this.logger.error({ subject, opts, msg, error });
          this.logger.error(error as Error);

          throw error;
        }
      }
    })(sub);
  }

  async publish(subject: string, payload?: Payload, opts?: PublishOptions) {
    await this.connect();

    await this.nc!.publish(subject, payload, opts);
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
    const data = operation.params.parse(request);
    const msg = JSON.stringify(data);

    const res = await this.request(operation.subject, msg, opts);
    const result = operation.result.parse(res.json());

    return result;
  }

  async request(subject: string, payload?: Payload, opts?: RequestOptions) {
    await this.connect();

    const result = await this.nc!.request(subject, payload, opts);

    return result;
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
    const data = operation.params.parse(request);
    const msg = JSON.stringify(data);

    const responses = await this.requestMany(operation.subject, msg, opts);
    const results = [];

    for await (const res of responses) {
      const result = operation.result.parse(res.json());
      results.push(result);
    }

    return results;
  }

  async requestMany(
    subject: string,
    payload?: Payload,
    opts?: RequestManyOptions,
  ) {
    await this.connect();

    const result = await this.nc!.requestMany(subject, payload, opts);

    return result;
  }
}

import {
  NatsConnection,
  Payload,
  RequestOptions,
  RequestManyOptions,
  RequestStrategy,
  PublishOptions,
  SubscriptionOptions,
  Subscription,
  Msg,
} from "nats";
import { NatsTracer } from "./NatsTracer.js";
import { Logger } from "@logtape/logtape";

export class NatsClient {
  private nc: NatsConnection | null = null;

  constructor(
    private logger: Logger,
    private natsConnection: Promise<NatsConnection>,
    private natsTracer: NatsTracer,
  ) {
    this.natsConnection.finally(() => {
      // FIXME why isn't the info showing?
      this.logger.debug("connected", { ...this.nc?.info });
    });
  }

  async connect(): Promise<NatsConnection> {
    this.nc = await this.natsConnection;

    if (!this.nc) throw new Error(`Unable to connect to NATS`);

    return this.nc!;
  }

  async request(subject: string, payload?: Payload, opts?: RequestOptions) {
    return this.natsTracer.withSpan(
      {
        operation: "request",
        subject,
        payload,
        opts,
      },
      async (span) => {
        await this.connect();

        const options = {
          timeout: 5_000,
          ...opts,
          headers: this.natsTracer.getHeaders(opts?.headers),
        };

        this.logger.debug("request", { subject, options });

        return this.nc?.request(subject, payload, options);
      },
    );
  }

  requestMany(subject: string, payload?: Payload, opts?: RequestManyOptions) {
    return this.natsTracer.withSpan(
      {
        operation: "request",
        subject,
        payload,
        opts,
      },
      async (span) => {
        await this.connect();

        const options = {
          strategy: RequestStrategy.Timer,
          maxWait: 5_000,
          ...opts,
          headers: this.natsTracer.getHeaders(opts?.headers),
        };

        this.logger.debug("requestMany", { subject, options });

        return this.nc?.requestMany(subject, payload, options);
      },
    );
  }

  publish(subject: string, payload?: Payload, opts?: PublishOptions) {
    return this.natsTracer.withSpan(
      {
        operation: "publish",
        subject,
        payload,
        opts,
      },
      async (span) => {
        await this.connect();

        const options = {
          ...opts,
          headers: this.natsTracer.getHeaders(opts?.headers),
        };

        this.logger.debug("publish", { subject, options });

        return this.nc?.publish(subject, payload, options);
      },
    );
  }

  subscribe(
    subject: string,
    opts: SubscriptionOptions,
    handler: (msg: Msg) => Promise<void>,
  ) {
    this.natsTracer.withSpan(
      { operation: "subscribe", subject, opts },
      async (span) => {
        await this.connect();

        this.logger.debug("subscribe", { subject, options: opts });

        const sub = this.nc!.subscribe(subject, opts);

        (async (sub: Subscription) => {
          for await (const msg of sub) {
            await this.natsTracer.withSpanForMsg(
              {
                operation: "receive",
                subject,
                opts,
                msg,
              },
              async (span) => {
                await handler(msg);
              },
            );
          }
        })(sub);
      },
    );
  }
}

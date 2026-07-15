import { Logger } from "@logtape/logtape";
import {
  connect,
  Msg,
  NatsConnection,
  Payload,
  RequestOptions,
  Subscription,
  SubscriptionOptions,
} from "@nats-io/transport-node";

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
        this.logger.info("connect");

        const connection = await connect();
        this.nc = connection;
        resolve(connection);
      } catch (error) {
        // 3. Reset the cache on failure so future attempts can retry
        this.pendingConnection = null;
        this.nc = null;
        reject(error);
      }
    });

    return this.pendingConnection;
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

  async request(subject: string, payload?: Payload, opts?: RequestOptions) {
    await this.connect();

    const result = await this.nc!.request(subject, payload, opts);

    return result;
  }
}

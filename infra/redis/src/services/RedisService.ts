import { Logger } from "@logtape/logtape";
import { RedisConfig } from "../models/RedisConfig.js";
import { createClient } from "redis";

export type RedisClient = ReturnType<typeof createClient>;

export class RedisService {
  private pendingClient: Promise<RedisClient> | null = null;

  constructor(
    private logger: Logger,
    private redisConfig: RedisConfig,
  ) {}

  async getClient() {
    if (this.pendingClient) {
      return this.pendingClient;
    }

    this.pendingClient = new Promise(async (resolve, reject) => {
      try {
        this.logger.debug("connect");

        const client = createClient({
          ...this.redisConfig,
          RESP: 3,
        });

        client.on("error", (error) => {
          this.logger.error(`Redis client error`, { error });
          this.logger.error(error);
        });

        await client.connect();

        resolve(client as unknown as RedisClient);
      } catch (error) {
        this.pendingClient = null;
        reject(error);
      }
    });

    return this.pendingClient;
  }
}

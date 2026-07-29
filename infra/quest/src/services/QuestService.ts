import postgres from "postgres";
import { Logger } from "@logtape/logtape";
import { Sender } from "@questdb/nodejs-client";
import { QuestConfig } from "../models/QuestConfig.js";

export class QuestService {
  constructor(
    private logger: Logger,
    private questConfig: QuestConfig,
  ) {}

  sql() {
    const sql = postgres({
      host: this.questConfig.host,
      port: this.questConfig.port,
      user: this.questConfig.user,
      pass: this.questConfig.pass,
      database: this.questConfig.database,
    });

    return sql;
  }

  async checkVersion() {
    const sql = this.sql();
    return sql`SELECT version()`;
  }

  /**
   * Create a QuestDB Sender instance and connect to a QuestDB server.
   *
   * @example
   * ```ts
   * import { createSender } from '@fbt/quest';
   *
   * const sender = await createSender();
   * await sender
   *    .table('<table>')
   *    .symbol('<name>', <value>)
   *    .at(new Date().getTime(), "ms")
   * sender.flush();
   * sender.close();
   * ```
   */
  async createSender(service?: string) {
    const logger = this.logger.getChild("sender");

    const conf = `http::addr=${this.questConfig.host}:${this.questConfig.senderPort};username=${this.questConfig.user};password=${this.questConfig.pass};`;

    const sender = await Sender.fromConfig(conf, {
      log: (level, message) =>
        logger.emit({
          timestamp: new Date().getTime(),
          level: level === "warn" ? "warning" : level,
          message: [message],
          rawMessage: String(message),
          properties: {},
        }),
    });

    return sender;
  }
}

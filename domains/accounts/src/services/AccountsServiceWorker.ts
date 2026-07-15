import { NatsService } from "@fbt/nats";
import { AccountsService } from "./AccountsService.js";
import { Logger } from "@logtape/logtape";
import { ListAccountsOperation } from "../operations/ListAccountsOperation.js";

const operations = [ListAccountsOperation];

export class AccountsServiceWorker {
  constructor(
    private accountsService: AccountsService,
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async start() {
    this.logger.info("start");

    this.subscribeOperations();
  }

  async subscribeOperations() {
    this.logger.info("subscribeOperations", {
      operations: operations.map((o) => `${o.subject} -> ${o.method}`),
    });

    for await (const operation of operations) {
      this.nats.subscribe(operation.subject, {}, async (msg) => {
        const data = msg.json();
        const request = operation.params[0]?.parse(data);
        // @ts-expect-error
        const res = await this.accountsService[operation.method](request);
        const result = operation.result.parse(res);

        this.logger.info("handler", {
          subject: msg.subject,
          headers: msg.headers,
          request,
          result,
        });

        msg.respond(JSON.stringify(result));
      });
    }
  }
}

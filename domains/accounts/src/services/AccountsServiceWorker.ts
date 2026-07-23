import { NatsService } from "@fbt/nats";
import { AccountsService } from "./AccountsService.js";
import { Logger } from "@logtape/logtape";
import { ListAccountsOperation } from "../operations/ListAccountsOperation.js";

const operations = [
  // service operations
  ListAccountsOperation,

  // introspection
  // - methodz
  // observability
  // - healthz
  // - metricz
];

export class AccountsServiceWorker {
  constructor(
    private accountsService: AccountsService,
    private nats: NatsService,
    private logger: Logger,
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
      this.nats.subscribeOperation(
        operation,
        {},
        // @ts-expect-error
        async (request) => {
          // @ts-expect-error
          return this.accountsService[operation.method](request);
        },
      );
    }
  }
}

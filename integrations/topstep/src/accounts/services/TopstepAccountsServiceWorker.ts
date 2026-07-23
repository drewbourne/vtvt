import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { ListAccountsForBrokerOperation } from "@fbt/accounts/operations";
import { TopstepAccountsService } from "./TopstepAccountsService.js";

const operations = [ListAccountsForBrokerOperation];

export class TopstepAccountsServiceWorker {
  constructor(
    private accountsService: TopstepAccountsService,
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

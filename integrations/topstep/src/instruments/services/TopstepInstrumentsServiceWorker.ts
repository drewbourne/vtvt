import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { ListInstrumentsForBrokerOperation } from "@fbt/market/operations";
import { TopstepInstrumentsService } from "./TopstepInstrumentsService.js";

const operations = [ListInstrumentsForBrokerOperation];

export class TopstepInstrumentsServiceWorker {
  constructor(
    private instrumentsService: TopstepInstrumentsService,
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
          return this.instrumentsService[operation.method](request);
        },
      );
    }
  }
}

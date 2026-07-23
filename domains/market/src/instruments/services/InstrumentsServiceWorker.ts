import { NatsService } from "@fbt/nats";
import { InstrumentsService } from "./InstrumentsService.js";
import { Logger } from "@logtape/logtape";
import { ListInstrumentsOperation } from "../operations/ListInstrumentsOperation.js";
import { GetInstrumentOperation } from "../operations/GetInstrumentOperation.js";
import { GetInstrumentForSymbolOperation } from "../operations/GetInstrumentForSymbolOperation.js";

const operations = [
  // service operations
  ListInstrumentsOperation,
  GetInstrumentOperation,
  GetInstrumentForSymbolOperation,

  // introspection
  // - methodz
  // observability
  // - healthz
  // - metricz
];

export class InstrumentsServiceWorker {
  constructor(
    private instrumentsService: InstrumentsService,
    private nats: NatsService,
    private logger: Logger,
  ) {}

  async start() {
    this.logger.debug("start");

    this.subscribeOperations();
  }

  async subscribeOperations() {
    this.logger.debug("subscribeOperations", {
      operations: operations.map((o) => `${o.subject} -> ${o.method}`),
    });

    for await (const operation of operations) {
      this.nats.subscribeOperation(
        // @ts-expect-error
        operation,
        {},
        async (request) => {
          // @ts-expect-error
          return this.instrumentsService[operation.method](request);
        },
      );
    }
  }
}

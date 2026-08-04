import { NatsServiceWorker } from "@fbt/nats";
import { InstrumentsService } from "./InstrumentsService.js";
import { Logger } from "@logtape/logtape";
import { ListInstrumentsOperation } from "../operations/ListInstrumentsOperation.js";
import { GetInstrumentOperation } from "../operations/GetInstrumentOperation.js";
import { GetInstrumentForSymbolOperation } from "../operations/GetInstrumentForSymbolOperation.js";

export class InstrumentsServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private instrumentsService: InstrumentsService,
  ) {}

  async start() {
    this.logger.debug("start");

    await this.natsServiceWorker.addService(
      {
        name: `fbt.accounts`,
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: { serviceLevel: "1" },
      },
      [
        this.natsServiceWorker.handler(
          ListInstrumentsOperation,
          { operationLevel: "2" },
          async ({ params }) => {
            return this.instrumentsService.listInstruments(params);
          },
        ),
        this.natsServiceWorker.handler(
          GetInstrumentOperation,
          { operationLevel: "2" },
          async ({ params }) => {
            return this.instrumentsService.getInstrument(params);
          },
        ),
        this.natsServiceWorker.handler(
          GetInstrumentForSymbolOperation,
          { operationLevel: "2" },
          async ({ params }) => {
            return this.instrumentsService.getInstrumentForSymbol(params);
          },
        ),
      ],
    );
  }
}

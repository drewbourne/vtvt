import { NatsServiceWorker } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { ListInstrumentsForBrokerOperation } from "@fbt/market/operations";
import { TopstepInstrumentsService } from "./TopstepInstrumentsService.js";

export class TopstepInstrumentsServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private instrumentsService: TopstepInstrumentsService,
  ) {}

  async start() {
    this.logger.info("start");

    await this.natsServiceWorker.addService(
      {
        name: `fbt.accounts`,
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: { serviceLevel: "1" },
      },
      [
        this.natsServiceWorker.handler(
          ListInstrumentsForBrokerOperation,
          { operationLevel: "2" },
          async ({ params }) => {
            return this.instrumentsService.listInstrumentsForBroker(params);
          },
        ),
      ],
    );
  }
}

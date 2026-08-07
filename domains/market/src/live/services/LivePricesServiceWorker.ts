import { NatsServiceWorker } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { LivePricesService } from "./LivePricesService.js";
import { SubscribeQuotesForInstrumentOperation } from "../operations/SubscribeQuotesForInstrumentOperation.js";

export class LivePriceServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private livePricesService: LivePricesService,
  ) {}

  async start() {
    this.logger.debug("start");

    await this.natsServiceWorker.addService(
      {
        name: "FBT_MARKET_LIVE_PRICES",
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: {},
      },
      [
        this.natsServiceWorker.handler(
          SubscribeQuotesForInstrumentOperation,
          {},
          async ({ params }) => {
            return this.livePricesService.subscribeQuotesForInstrument(
              params,
              {},
            );
          },
        ),
      ],
    );
  }
}

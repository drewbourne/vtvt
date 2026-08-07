import { SubscribeQuotesForInstrumentFromBrokerOperation } from "@fbt/market/operations";
import { NatsClient, NatsServiceWorker } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { TopstepLivePricesService } from "./TopstepLivePricesService.js";
import { TopstepBrokerId } from "../../models/TopstepBrokerId.js";

export class TopstepLivePricesServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private livePricesService: TopstepLivePricesService,
  ) {}

  async start() {
    this.logger.info("start");

    await this.natsServiceWorker.addService(
      {
        name: `FBT_TOPSTEP_LIVE_PRICES`,
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: {},
      },
      [
        this.natsServiceWorker.handler(
          {
            ...SubscribeQuotesForInstrumentFromBrokerOperation,
            subject: `${SubscribeQuotesForInstrumentFromBrokerOperation.subject}.${TopstepBrokerId}`,
          },
          {},
          async ({ params, nc }) => {
            await this.livePricesService.subscribeInstrument(
              params.instrument,
              {
                onMarketQuote: (quote) => {
                  nc.publish(params.subject, JSON.stringify(quote));
                },
              },
            );

            return { status: "success", result: {} } as const;
          },
        ),
      ],
    );
  }
}

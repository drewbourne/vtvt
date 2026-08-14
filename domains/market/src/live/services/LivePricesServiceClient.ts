import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import {
  SubscribeQuotesForInstrumentOperation,
  SubscribeQuotesForInstrumentRequest,
  SubscribeQuotesForInstrumentResult,
} from "../operations/SubscribeQuotesForInstrumentOperation.js";
import { MarketQuote } from "../models/MarketQuote.js";
import { Msg } from "nats";

export class LivePricesServiceClient {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async subscribeQuotesForInstrument(
    request: SubscribeQuotesForInstrumentRequest,
    handler: (ctx: {
      request: SubscribeQuotesForInstrumentRequest;
      quote: MarketQuote;
      msg: Msg;
    }) => Promise<void>,
  ): Promise<SubscribeQuotesForInstrumentResult> {
    const logger = this.logger.with({
      instrumentId: request.instrument.id,
      brokerId: request.instrument.brokerId,
      brokerSymbolId: request.instrument.brokerSymbolId,
    });

    logger.debug("subscribeQuotesForInstrument requesting");

    const result = await this.nats.requestOperation(
      request,
      SubscribeQuotesForInstrumentOperation,
    );

    logger.debug("subscribeQuotesForInstrument", { request, result });

    if (result.status === "success") {
      logger.debug("subscribeQuotesForInstrument subscribing");

      this.nats.subscribe(result.subject, {}, async (msg) => {
        const data = msg.json();
        const result = MarketQuote.safeParse(data, { reportInput: true });
        if (result.success) {
          const quote = result.data;
          handler({ quote, msg, request });
        } else {
          logger.error(`Error parsing MarketQuote`, {
            data,
            error: result.error,
          });
          throw result.error;
        }
      });
    }

    return result;
  }
}

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
    this.logger.debug("subscribeQuotesForInstrument requesting");

    const result = await this.nats.requestOperation(
      request,
      SubscribeQuotesForInstrumentOperation,
    );

    this.logger.debug("subscribeQuotesForInstrument", { request, result });

    if (result.status === "success") {
      this.logger.debug("subscribeQuotesForInstrument subscribing");

      this.nats.subscribe(result.subject, {}, async (msg) => {
        const data = msg.json();
        const quote = MarketQuote.parse(data);
        handler({ quote, msg, request });
      });
    }

    return result;
  }
}

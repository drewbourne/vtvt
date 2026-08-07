import { NatsClient } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { MarketQuote } from "../models/MarketQuote.js";
import { Msg, SubscriptionOptions } from "nats";
import {
  SubscribeQuotesForInstrumentRequest,
  SubscribeQuotesForInstrumentResult,
} from "../operations/SubscribeQuotesForInstrumentOperation.js";
import {
  SubscribeQuotesForInstrumentFromBrokerOperation,
  SubscribeQuotesForInstrumentFromBrokerRequest,
  SubscribeQuotesForInstrumentFromBrokerResult,
} from "../operations/SubscribeQuotesForInstrumentFromBrokerOperation.js";

export class LivePricesService {
  constructor(
    private logger: Logger,
    private nats: NatsClient,
  ) {}

  async subscribeQuotesForInstrument(
    request: SubscribeQuotesForInstrumentRequest,
    opts: SubscriptionOptions,
  ): Promise<SubscribeQuotesForInstrumentResult> {
    const logger = this.logger.with({
      id: request.instrument.id,
      brokerId: request.instrument.brokerId,
      brokerSymbolId: request.instrument.brokerSymbolId,
    });

    try {
      const subject = `fbt.events.market.quotes.${request.instrument.brokerId}.${request.instrument.brokerSymbolId}`;

      const params = SubscribeQuotesForInstrumentFromBrokerRequest.parse({
        instrument: request.instrument,
        subject,
      });

      const payload = JSON.stringify(params);

      const msg = await this.nats.request(
        `${SubscribeQuotesForInstrumentFromBrokerOperation.subject}.${request.instrument.brokerId}`,
        payload,
      );

      const reply = msg?.json();
      const result = SubscribeQuotesForInstrumentFromBrokerResult.parse(reply);

      logger.info("subscribeQuotesForInstrument result", { result });

      return { status: "success", subject };
    } catch (error) {
      logger.error("subscribeQuotesForInstrument error", { error });

      return { status: "failure", error };
    }
  }
}

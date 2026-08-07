import { serviceOperation } from "@fbt/service";
import * as z from "zod";
import { BrokerSymbolId, Instrument, InstrumentId } from "../../models.js";
import { BrokerId } from "@fbt/accounts/models";

export const SubscribeQuotesForInstrumentFromBrokerRequest = z.object({
  instrument: Instrument,

  // subject to publish to
  subject: z.string(),
});

export type SubscribeQuotesForInstrumentFromBrokerRequest = z.infer<
  typeof SubscribeQuotesForInstrumentFromBrokerRequest
>;

export const SubscribeQuotesForInstrumentFromBrokerResult =
  z.discriminatedUnion("status", [
    z.object({ status: z.literal("success"), result: z.unknown() }),
    z.object({ status: z.literal("failure"), error: z.unknown() }),
  ]);

export type SubscribeQuotesForInstrumentFromBrokerResult = z.infer<
  typeof SubscribeQuotesForInstrumentFromBrokerResult
>;

export const SubscribeQuotesForInstrumentFromBrokerOperation = serviceOperation(
  {
    method: "subscribeQuotesForInstrumentFromBroker",
    subject: "fbt.market.rpc.subscribeQuotesForInstrumentFromBroker",
    params: SubscribeQuotesForInstrumentFromBrokerRequest,
    result: SubscribeQuotesForInstrumentFromBrokerResult,
  },
);

import { serviceOperation } from "@fbt/service";
import { Instrument } from "../../models.js";
import * as z from "zod";

export const SubscribeQuotesForInstrumentRequest = z.object({
  instrument: Instrument,
});

export type SubscribeQuotesForInstrumentRequest = z.infer<
  typeof SubscribeQuotesForInstrumentRequest
>;

export const SubscribeQuotesForInstrumentResult = z.discriminatedUnion(
  "status",
  [
    z.object({
      status: z.literal("success"),
      subject: z.string(),
    }),
    z.object({
      status: z.literal("failure"),
      error: z.unknown(),
    }),
  ],
);

export type SubscribeQuotesForInstrumentResult = z.infer<
  typeof SubscribeQuotesForInstrumentResult
>;

export const SubscribeQuotesForInstrumentOperation = serviceOperation({
  method: "subscribeQuotesForInstrument",
  subject: "fbt.market.rpc.subscribeQuotesForInstrument",
  params: SubscribeQuotesForInstrumentRequest,
  result: SubscribeQuotesForInstrumentResult,
});

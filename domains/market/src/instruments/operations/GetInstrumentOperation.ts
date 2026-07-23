import * as z from "zod";
import { Instrument } from "../models/Instrument.js";
import { serviceOperation } from "@fbt/service";
import { InstrumentId } from "../models/InstrumentId.js";

export const GetInstrumentRequest = z.object({
  id: InstrumentId,
});

export type GetInstrumentRequest = z.infer<typeof GetInstrumentRequest>;

export const GetInstrumentResult = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    instrument: Instrument,
  }),
  z.object({
    status: z.literal("failure"),
    error: z.unknown(),
  }),
]);

export type GetInstrumentResult = z.infer<typeof GetInstrumentResult>;

export const GetInstrumentOperation = serviceOperation({
  method: "getInstrument",
  subject: "fbt.market.rpc.getInstrument",
  params: GetInstrumentRequest,
  result: GetInstrumentResult,
});

import * as z from "zod";
import { Symbol } from "../../models/Symbol.js";
import { Instrument } from "../models/Instrument.js";
import { serviceOperation } from "@fbt/service";

export const GetInstrumentForSymbolRequest = z.object({
  symbol: Symbol,
});

export type GetInstrumentForSymbolRequest = z.infer<
  typeof GetInstrumentForSymbolRequest
>;

export const GetInstrumentForSymbolResult = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    instrument: Instrument,
  }),
  z.object({
    status: z.literal("failure"),
    error: z.unknown(),
  }),
]);

export type GetInstrumentForSymbolResult = z.infer<
  typeof GetInstrumentForSymbolResult
>;

export const GetInstrumentOperation = serviceOperation({
  method: "getInstrumentForSymbol",
  subject: "fbt.market.rpc.getInstrumentForSymbol",
  params: GetInstrumentForSymbolRequest,
  result: GetInstrumentForSymbolResult,
});

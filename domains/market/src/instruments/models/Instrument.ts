import * as z from "zod";
import { BrokerId } from "@fbt/accounts/models";
import { Symbol, BrokerSymbolId } from "@fbt/market/models";
import { InstrumentId } from "./InstrumentId.js";

const Base = z.object({
  id: InstrumentId,
  broker: BrokerId,
  brokerSymbolId: BrokerSymbolId,

  /** `MNQ` */
  symbol: Symbol,

  /** `MNQH6` */
  name: z.string(),

  /** `Micro E-mini Nasdaq-100: March 2026`  */
  description: z.string(),
});

const Crypto = z.object({
  ...Base.shape,
  instrumentType: z.literal("crypto"),
});

const Forex = z.object({
  ...Base.shape,
  instrumentType: z.literal("forex"),
});

const Future = z.object({
  ...Base.shape,
  instrumentType: z.literal("future"),

  tickSize: z.number(),
  tickValue: z.number(),
  activeContract: z.boolean(),
});

const Stock = z.object({
  ...Base.shape,
  instrumentType: z.literal("stock"),
});

export const Instrument = z.discriminatedUnion("instrumentType", [
  Crypto,
  Forex,
  Future,
  Stock,
]);

export type Instrument = z.infer<typeof Instrument>;

export type InstrumentType = Instrument["instrumentType"];

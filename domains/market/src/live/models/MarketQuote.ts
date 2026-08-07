import { BrokerId } from "@fbt/accounts/models";
import * as z from "zod";
import { BrokerSymbolId, InstrumentId, Symbol } from "../../models.js";

export const MarketQuote = z.object({
  instrumentId: InstrumentId,
  brokerId: BrokerId,
  brokerSymbolId: BrokerSymbolId,
  symbol: Symbol,

  time: z.string(),
  bestBid: z.number().min(0).optional(), // 23028,
  bestAsk: z.number().min(0).optional(), // 23028.25,
  lastPrice: z.number().min(0).optional(),

  change: z.number().optional(),
  changePercent: z.number().optional(),

  open: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  volume: z.number().optional(),
});

export type MarketQuote = z.infer<typeof MarketQuote>;

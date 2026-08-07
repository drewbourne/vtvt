import * as z from "zod";
import { BrokerSymbolId, InstrumentId } from "../../models.js";
import { BrokerId } from "@fbt/accounts/models";

export const MarketTrade = z.object({
  instrumentId: InstrumentId,
  brokerId: BrokerId,
  brokerSymbolId: BrokerSymbolId,

  time: z.date(),
  price: z.number(),
  side: z.enum(["buy", "sell"]),
  volume: z.number().min(0),
  index: z.number().min(0),
});

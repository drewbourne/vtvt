import * as z from "zod";
import { AccountId, BrokerId } from "@fbt/accounts/models";
import { Symbol, BrokerSymbolId, InstrumentId } from "@fbt/market/models";

export const WatchlistEntry = z.object({
  accountId: AccountId,
  instrumentId: InstrumentId,
  symbol: Symbol,
  brokerId: BrokerId,
  brokerSymbolId: BrokerSymbolId,
  addedAt: z.date().optional(),
});

export type WatchlistEntry = z.infer<typeof WatchlistEntry>;

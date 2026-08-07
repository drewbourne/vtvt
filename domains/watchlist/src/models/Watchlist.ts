import * as z from "zod";
import { AccountId, BrokerId } from "@fbt/accounts/models";
import { Symbol, BrokerSymbolId } from "@fbt/market/models";

export const Watchlist = z.object({
  accountId: AccountId,
  symbol: Symbol,
  brokerId: BrokerId,
  brokerSymbolId: BrokerSymbolId,
  addedAt: z.date().optional(),
});

export type Watchlist = z.infer<typeof Watchlist>;

import * as z from "zod";
import { AccountId, BrokerId } from "@fbt/accounts/models";
import { Symbol, BrokerSymbolId } from "@fbt/market/models";

export const Watchlist = z.object({
  accountId: AccountId,
  symbol: Symbol,
  broker: BrokerId,
  brokerSymbolId: BrokerSymbolId,
  addedAt: z.date(),
});

export type Watchlist = z.infer<typeof Watchlist>;

import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { AccountId, BrokerId } from "@fbt/accounts/models";
import { Symbol, BrokerSymbolId } from "@fbt/market/models";

export const RemoveSymbolFromWatchlistRequest = z.object({
  accountId: AccountId,
  symbol: Symbol,
  brokerId: BrokerId,
  brokerSymbolId: BrokerSymbolId,
});

export type RemoveSymbolFromWatchlistRequest = z.infer<
  typeof RemoveSymbolFromWatchlistRequest
>;

export const RemoveSymbolFromWatchlistResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success") }),
  z.object({ status: z.literal("failure"), error: z.unknown() }),
]);

export type RemoveSymbolFromWatchlistResult = z.infer<
  typeof RemoveSymbolFromWatchlistResult
>;

export const RemoveSymbolFromWatchlistOperation = serviceOperation({
  method: "removeSymbolFromWatchlist",
  subject: "fbt.watchlist.rpc.removeSymbolFromWatchlist",
  params: RemoveSymbolFromWatchlistRequest,
  result: RemoveSymbolFromWatchlistResult,
});

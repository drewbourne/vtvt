import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { AccountId, BrokerId } from "@fbt/accounts/models";
import { Symbol, BrokerSymbolId } from "@fbt/market/models";

export const AddSymbolToWatchlistRequest = z.object({
  accountId: AccountId,
  symbol: Symbol,
  brokerId: BrokerId,
  brokerSymbolId: BrokerSymbolId,
});

export type AddSymbolToWatchlistRequest = z.infer<
  typeof AddSymbolToWatchlistRequest
>;

export const AddSymbolToWatchlistResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success") }),
  z.object({ status: z.literal("failure"), error: z.object() }),
]);

export type AddSymbolToWatchlistResult = z.infer<
  typeof AddSymbolToWatchlistResult
>;

export const AddSymbolToWatchlistOperation = serviceOperation({
  method: "addSymbolToWatchlist",
  subject: "fbt.watchlist.rpc.addSymbolToWatchlist",
  params: [AddSymbolToWatchlistRequest],
  result: AddSymbolToWatchlistResult,
});

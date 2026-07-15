import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { AccountId } from "@fbt/accounts/models";
import { Watchlist } from "../models/Watchlist.js";

export const GetWatchlistForAccountRequest = z.object({
  accountId: AccountId,
});

export type GetWatchlistForAccountRequest = z.infer<
  typeof GetWatchlistForAccountRequest
>;

export const GetWatchlistForAccountResult = z.object({
  total: z.number(),
  count: z.number(),
  items: z.array(Watchlist),
});

export type GetWatchlistForAccountResult = z.infer<
  typeof GetWatchlistForAccountResult
>;

export const GetWatchlistForAccountOperation = serviceOperation({
  method: "getWatchlistForAccount",
  subject: "fbt.watchlist.rpc.getWatchlistForAccount",
  params: [GetWatchlistForAccountRequest],
  result: GetWatchlistForAccountResult,
});

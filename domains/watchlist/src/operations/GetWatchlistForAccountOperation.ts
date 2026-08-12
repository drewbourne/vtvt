import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { AccountId } from "@fbt/accounts/models";
import { WatchlistEntry } from "../models/WatchlistEntry.js";

export const GetWatchlistForAccountRequest = z.object({
  accountId: AccountId,
});

export type GetWatchlistForAccountRequest = z.infer<
  typeof GetWatchlistForAccountRequest
>;

export const GetWatchlistForAccountResult = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    count: z.number(),
    items: z.array(WatchlistEntry),
  }),
  z.object({
    status: z.literal("failure"),
    error: z.unknown(),
  }),
]);

export type GetWatchlistForAccountResult = z.infer<
  typeof GetWatchlistForAccountResult
>;

export const GetWatchlistForAccountOperation = serviceOperation({
  method: "getWatchlistForAccount",
  subject: "fbt.watchlist.rpc.getWatchlistForAccount",
  params: GetWatchlistForAccountRequest,
  result: GetWatchlistForAccountResult,
});

import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { Account } from "../models/Account.js";

export const ListAccountsRequest = z.object({
  filters: z.object({}),
  sorts: z.object({}),
  limit: z.number(),
  offset: z.number(),
});

export type ListAccountsRequest = z.infer<typeof ListAccountsRequest>;

export const ListAccountsResult = z.object({
  total: z.number(),
  count: z.number(),
  items: z.array(Account),
});

// export const Result = z.discriminatedUnion("status", [
//     z.object({ status: z.literal('success'), result: ... }),
//     z.object({ status: z.literal('error'), error: z.any() }),
// ])

export type ListAccountsResult = z.infer<typeof ListAccountsResult>;

export const ListAccountsOperation = serviceOperation({
  method: "listAccounts",
  subject: "fbt.accounts.rpc.listAccounts",
  params: ListAccountsRequest,
  result: ListAccountsResult,
});

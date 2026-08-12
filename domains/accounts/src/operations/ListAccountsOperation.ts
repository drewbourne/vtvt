import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { Account } from "../models/Account.js";

export const ListAccountsRequest = z.object({
  filters: z.object({}).optional(),
  sorts: z.object({}).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type ListAccountsRequest = z.infer<typeof ListAccountsRequest>;

export const ListAccountsResult = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    count: z.number(),
    items: z.array(Account),
  }),
  z.object({
    status: z.literal("error"),
    error: z.any(),
  }),
]);

export type ListAccountsResult = z.infer<typeof ListAccountsResult>;

export const ListAccountsOperation = serviceOperation({
  method: "listAccounts",
  subject: "fbt.accounts.rpc.listAccounts",
  params: ListAccountsRequest,
  result: ListAccountsResult,
});

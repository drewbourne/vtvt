import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { Account } from "../models/Account.js";
import { BrokerId } from "../models.js";

export const ListAccountsForBrokerRequest = z.object({
  brokers: z.array(BrokerId).optional(),
});

export type ListAccountsForBrokerRequest = z.infer<
  typeof ListAccountsForBrokerRequest
>;

export const ListAccountsForBrokerResult = z.object({
  total: z.number(),
  count: z.number(),
  items: z.array(Account),

  broker: BrokerId,
});

// export const Result = z.discriminatedUnion("status", [
//     z.object({ status: z.literal('success'), result: ... }),
//     z.object({ status: z.literal('error'), error: z.any() }),
// ])

export type ListAccountsForBrokerResult = z.infer<
  typeof ListAccountsForBrokerResult
>;

export const ListAccountsForBrokerOperation = serviceOperation({
  method: "listAccountsForBroker",
  subject: "fbt.accounts.rpc.listAccountsForBroker",
  params: ListAccountsForBrokerRequest,
  result: ListAccountsForBrokerResult,
});

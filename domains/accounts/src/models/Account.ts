import * as z from "zod";
import { AccountId } from "./AccountId.js";
import { BrokerId } from "./BrokerId.js";
import { BrokerAccountId } from "./BrokerAccountId.js";

export const Account = z.object({
  id: AccountId,
  brokerId: BrokerId,
  brokerAccountId: BrokerAccountId,
  name: z.string(),
  balance: z.number(),
  canTrade: z.boolean(),
  isVisble: z.boolean(),
});

export type Account = z.infer<typeof Account>;

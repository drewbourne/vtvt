import * as z from "zod";

export const BrokerAccountId = z.number().brand("BrokerAccountId");
export type BrokerAccountId = z.output<typeof BrokerAccountId>;

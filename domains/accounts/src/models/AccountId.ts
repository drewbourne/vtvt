import * as z from "zod";

export const AccountId = z.string().brand<"AccountId">();
export type AccountId = z.output<typeof AccountId>;

import * as z from "zod";

export const BrokerId = z.string().brand<"BrokerId">();
export type BrokerId = z.output<typeof BrokerId>;

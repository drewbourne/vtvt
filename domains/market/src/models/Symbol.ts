import * as z from "zod";

export const Symbol = z.string().brand<"Symbol">();
export type Symbol = z.output<typeof Symbol>;

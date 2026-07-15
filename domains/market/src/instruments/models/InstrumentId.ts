import * as z from "zod";

export const InstrumentId = z.string().brand<"InstrumentId">();
export type InstrumentId = z.output<typeof InstrumentId>;

import * as z from "zod";

export const BrokerSymbolId = z.string().brand<"BrokerSymbolId">();
export type BrokerSymbolId = z.output<typeof BrokerSymbolId>;

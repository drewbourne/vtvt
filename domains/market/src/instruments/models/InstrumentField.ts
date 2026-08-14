import * as z from "zod";

export const InstrumentField = z.enum([
  "id",
  "name",
  "symbol",
  "brokerId",
  "brokerSymbolId",
]);

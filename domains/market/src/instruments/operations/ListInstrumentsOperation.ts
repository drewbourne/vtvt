import * as z from "zod";
import { Instrument } from "../models/Instrument.js";
import { serviceOperation } from "@fbt/service";

const InstrumentField = z.enum([
  "id",
  "name",
  "symbol",
  "brokerId",
  "brokerInstrumentId",
]);

const InstrumentStringFilter = z.object({
  field: InstrumentField,
  op: z.enum(["eq", "neq", "startsWith", "endsWith"]),
  value: z.string(),
});

const InstrumentRegExpFilter = z.object({
  field: InstrumentField,
  op: z.enum(["match"]),
  value: z.string(),
});

const InstrumentFilter = z.discriminatedUnion("op", [
  InstrumentStringFilter,
  InstrumentRegExpFilter,
]);

const InstrumentSort = z.object({
  field: InstrumentField,
  sort: z.enum(["asc", "desc"]),
  nulls: z.enum(["first", "last"]),
});

export const ListInstrumentsRequest = z.object({
  filters: z.array(InstrumentFilter),
  sorts: z.array(InstrumentSort),
  limit: z.number(),
});

export type ListInstrumentsRequest = z.infer<typeof ListInstrumentsRequest>;

export const ListInstrumentsResult = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    count: z.number(),
    total: z.number(),
    items: z.array(Instrument),
  }),
  z.object({
    status: z.literal("failure"),
    error: z.unknown(),
  }),
]);

export type ListInstrumentsResult = z.infer<typeof ListInstrumentsResult>;

export const ListInstrumentsOperation = serviceOperation({
  method: "listInstruments",
  subject: "fbt.market.rpc.listInstruments",
  params: [ListInstrumentsRequest],
  result: ListInstrumentsResult,
});

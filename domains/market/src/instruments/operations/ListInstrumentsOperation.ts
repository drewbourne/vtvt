import * as z from "zod";
import { Instrument } from "../models/Instrument.js";
import { serviceOperation } from "@fbt/service";
import { BrokerId } from "@fbt/accounts/models";

const InstrumentField = z.enum([
  "id",
  "name",
  "symbol",
  "brokerId",
  "brokerSymbolId",
]);

const InstrumentIdFilter = z.object({
  field: z.literal("id"),
  op: z.enum(["eq"]),
  value: z.string(),
});

const InstrumentNameFilter = z.object({
  field: z.literal("name"),
  op: z.enum(["eq", "includes", "startsWith", "endsWith", "fuzzy"]),
  value: z.string(),
});

const InstrumentSymbolFilter = z.object({
  field: z.literal("symbol"),
  op: z.enum(["eq", "includes", "startsWith", "endsWith", "fuzzy"]),
  value: z.string(),
});

const InstrumentBrokerFilter = z.object({
  field: z.literal("brokerId"),
  op: z.enum(["in"]),
  value: z.array(BrokerId),
});

const InstrumentEnvironmentFilter = z.object({
  field: z.literal("environment"),
  op: z.enum(["eq"]),
  value: z.enum(["live", "sim"]),
});

const InstrumentFilter = z.discriminatedUnion("field", [
  InstrumentIdFilter,
  InstrumentNameFilter,
  InstrumentSymbolFilter,
  InstrumentBrokerFilter,
  InstrumentEnvironmentFilter,
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
  params: ListInstrumentsRequest,
  result: ListInstrumentsResult,
});

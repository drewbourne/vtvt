import * as z from "zod";
import { serviceOperation } from "@fbt/service";
import { Instrument } from "../models/Instrument.js";
import { BrokerId } from "@fbt/accounts/models";

export const ListInstrumentsForBrokerRequest = z.object({
  brokers: z.array(BrokerId).optional(),
  environment: z.enum(["live", "sim"]),
});

export type ListInstrumentsForBrokerRequest = z.infer<
  typeof ListInstrumentsForBrokerRequest
>;

export const ListInstrumentsForBrokerResult = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    broker: BrokerId,
    count: z.number(),
    items: z.array(Instrument),
  }),
  z.object({
    status: z.literal("failure"),
    error: z.unknown(),
  }),
]);

export type ListInstrumentsForBrokerResult = z.infer<
  typeof ListInstrumentsForBrokerResult
>;

export const ListInstrumentsForBrokerOperation = serviceOperation({
  method: "listInstrumentsForBroker",
  subject: "fbt.market.rpc.listInstrumentsForBroker",
  params: ListInstrumentsForBrokerRequest,
  result: ListInstrumentsForBrokerResult,
});

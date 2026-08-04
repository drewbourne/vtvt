import * as z from "zod";
import { serviceOperation } from "@fbt/service";

export const ListServicesRequest = z.object({
  name: z.string().optional(),
});

export type ListServicesRequest = z.infer<typeof ListServicesRequest>;

export const EndpointInfo = z.object({
  name: z.string(),
  subject: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type EndpointInfo = z.infer<typeof EndpointInfo>;

export const ServiceInfo = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  endpoints: z.array(EndpointInfo),
});

export type ServiceInfo = z.infer<typeof ServiceInfo>;

export const ListServicesResult = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), services: z.array(ServiceInfo) }),
  z.object({ status: z.literal("failure"), error: z.unknown() }),
]);

export type ListServicesResult = z.infer<typeof ListServicesResult>;

export const ListServicesOperation = serviceOperation({
  method: "listServices",
  subject: "fbt.system.rpc.listServices",
  params: ListServicesRequest,
  result: ListServicesResult,
});

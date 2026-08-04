import * as z from "zod";
import { ServiceOperation } from "./ServiceOperation.js";

export const ServiceDescriptor = z.object({
  name: z.string().regex(/fbt\.\w+/),
  version: z.string().regex(/\d+\.\d+\+\d+/),
  description: z.string(),
  metadata: z.record(z.string(), z.string()),
});

export type ServiceDescriptor = z.infer<typeof ServiceDescriptor>;

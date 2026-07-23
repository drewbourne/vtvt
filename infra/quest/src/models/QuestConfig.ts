import * as z from "zod";

export const QuestConfig = z.object({
  host: z.string(),
  port: z.number(),
  senderPort: z.number(),
  user: z.string(),
  pass: z.string(),
  database: z.string(),
});

export type QuestConfig = z.infer<typeof QuestConfig>;

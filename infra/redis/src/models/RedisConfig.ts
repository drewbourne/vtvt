import * as z from "zod";

export const RedisConfig = z.object({
  url: z.string().optional(),
});

export type RedisConfig = z.infer<typeof RedisConfig>;

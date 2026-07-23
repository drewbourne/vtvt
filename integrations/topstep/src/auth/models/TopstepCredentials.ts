import * as z from "zod";

export const TopstepCredentials = z.object({
  username: z.string().min(1),
  apiKey: z.string().min(1),
});

export type TopstepCredentials = z.infer<typeof TopstepCredentials>;

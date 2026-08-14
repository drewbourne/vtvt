import { runAction } from "@/next/runAction";
import { createSSEHandler } from "use-next-sse";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const GET = runAction(
  {
    name: "GET /services",
    attributes: {
      responseType: "sse",
    },
  },
  ({ servicesClient }) =>
    createSSEHandler(async (send, close) => {
      servicesClient.subscribe({
        onInfo: (event) => send(event, "info"),
        onStats: (event) => send(event, "stats"),
      });
    }),
);

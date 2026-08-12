import { runAction } from "@/next/runAction";
import { InstrumentId } from "@fbt/market/models";
import { createSSEHandler } from "use-next-sse";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const GET = runAction(
  { name: "GET /quotes" },
  ({ request, instrumentsClient, livePricesClient }) =>
    createSSEHandler(async (send, close) => {
      const instrumentIdSearchParam =
        request?.nextUrl?.searchParams.getAll("instrumentId") ?? [];

      const instrumentIds = instrumentIdSearchParam.map((id) =>
        InstrumentId.parse(id),
      );

      const instruments = await Promise.all(
        instrumentIds.map((id) => instrumentsClient.getInstrument({ id })),
      );

      for (const res of instruments) {
        if (res.status === "success") {
          livePricesClient.subscribeQuotesForInstrument(
            {
              instrument: res.instrument,
            },
            async ({ quote }) => {
              send(quote, "quote");
            },
          );
        }
      }

      return () => {
        // unsubscribe?
      };
    }),
);

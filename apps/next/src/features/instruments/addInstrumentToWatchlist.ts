"use server";

import { runAction } from "@/next/runAction";
import { AccountId } from "@fbt/accounts/models";
import { InstrumentId } from "@fbt/market/models";

export const addInstrumentToWatchlist = runAction(
  { name: "addInstrumentToWatchlist" },
  ({ instrumentsClient, watchlistClient, logger }) =>
    async (formData: FormData) => {
      const accountId = AccountId.parse(formData.get("accountId"));
      const instrumentId = InstrumentId.parse(formData.get("instrumentId"));

      logger.info("addInstrumentToWatchlist", {
        accountId,
        instrumentId,
      });

      const instrumentResult = await instrumentsClient.getInstrument({
        id: instrumentId,
      });

      if (instrumentResult.status === "success") {
        const { instrument } = instrumentResult;

        const result = await watchlistClient.addSymbolToWatchlist({
          accountId,
          instrumentId,
          // Why?
          brokerId: instrument.brokerId,
          brokerSymbolId: instrument.brokerSymbolId,
          symbol: instrument.symbol,
        });
      }
    },
);

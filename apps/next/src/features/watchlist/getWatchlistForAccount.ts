import { runAction } from "@/next/runAction";
import { Account } from "@fbt/accounts/models";
import { cache } from "react";

export const getWatchlistForAccount = cache(
  runAction(
    { name: "getWatchlistForAccount" },
    ({ watchlistClient }) =>
      async (account: Account | null) => {
        if (!account) return null;

        const watchlistResult = await watchlistClient.getWatchlistForAccount({
          accountId: account?.id,
        });

        if (watchlistResult.status === "success") {
          return watchlistResult.items;
        } else {
          return null;
        }
      },
  ),
);

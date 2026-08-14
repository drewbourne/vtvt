import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { WatchlistTable } from "./WatchlistTable";
import { runAction } from "@/next/runAction";
import { Account } from "@fbt/accounts/models";
import { VStack } from "@styled-system/jsx";
import { getWatchlistForAccount } from "./getWatchlistForAccount";

export const WatchlistPanel = runAction(
  { name: "WatchlistPanel" },
  () =>
    async ({ account }: { account: Account | null }) => {
      const watchlist = await getWatchlistForAccount(account);

      return (
        <Panel>
          <PanelHeader>
            <h2>Watchlist</h2>
          </PanelHeader>
          <PanelContent>
            {!watchlist && <VStack>No watchlist entries</VStack>}
            {watchlist && <WatchlistTable watchlist={watchlist} />}
          </PanelContent>
        </Panel>
      );
    },
);

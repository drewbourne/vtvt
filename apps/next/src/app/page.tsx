import Counter from "@/counter/Counter";
import { AccountsPanel } from "@/features/accounts/AccountsPanel";
import { WatchlistPanel } from "@/features/watchlist/WatchlistPanel";
import { runAction } from "@/next/runAction";
import { VStack } from "@styled-system/jsx";

const Home = runAction(
  { name: "GET /" },
  ({ accountsClient, watchlistClient }) =>
    async () => {
      const accountsResult = await accountsClient.listAccounts({});
      if (accountsResult.status !== "success") {
        return <VStack>Error: listAccounts</VStack>;
      }

      const account = accountsResult.items[0];
      if (!account) {
        return <VStack>No Accounts</VStack>;
      }

      const watchlistResult = await watchlistClient.getWatchlistForAccount({
        accountId: account?.id,
      });
      if (watchlistResult.status !== "success") {
        return <VStack>Error: getWatchlistForAccount</VStack>;
      }

      return (
        <VStack gap="1" alignItems="stretch">
          {/* <Counter /> */}
          <AccountsPanel accounts={accountsResult.items} />
          <WatchlistPanel entries={watchlistResult.items} />
        </VStack>
      );
    },
);

export default Home;

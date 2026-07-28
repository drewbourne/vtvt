import Counter from "@/counter/Counter";
import { AccountsPanel } from "@/features/accounts/AccountsPanel";
import { WatchlistPanel } from "@/features/watchlist/WatchlistPanel";
import { VStack } from "@styled-system/jsx";

export default function Home() {
  return (
    <VStack gap="1" alignItems="start">
      <Counter />
      <AccountsPanel />
      <WatchlistPanel />
    </VStack>
  );
}

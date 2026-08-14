import { getActiveAccount } from "@/features/accounts/getActiveAccount";
import { AccountsPanel } from "@/features/accounts/AccountsPanel";
import { InstrumentsPanel } from "@/features/instruments/InstrumentsPanel";
import { ServicesPanel } from "@/features/services/ServicesPanel";
import { WatchlistPanel } from "@/features/watchlist/WatchlistPanel";
import { runAction } from "@/next/runAction";
import { VStack } from "@styled-system/jsx";

type HomeProps = {
  searchParams?: Promise<{ instrumentSearchTerm?: string }>;
};

const Home = async (props: HomeProps) => {
  const account = await getActiveAccount();

  const searchParams = await props.searchParams;

  return (
    <VStack gap="1" alignItems="stretch">
      <AccountsPanel />
      <WatchlistPanel account={account} />
      <InstrumentsPanel
        account={account}
        searchTerm={searchParams?.instrumentSearchTerm}
      />
      <ServicesPanel />
    </VStack>
  );
};

export default Home;

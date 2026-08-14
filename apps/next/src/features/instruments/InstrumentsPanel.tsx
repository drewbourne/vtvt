import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { InstrumentsTable } from "./InstrumentsTable";
import { HStack, VStack } from "@styled-system/jsx";
import { InstrumentSearch } from "./InstrumentSearch";
import { getInstrumentsList } from "./getInstrumentsList";
import { Account } from "@fbt/accounts/models";

export async function InstrumentsPanel({
  account,
  searchTerm,
}: {
  account: Account | null;
  searchTerm?: string;
}) {
  const instruments = await getInstrumentsList(searchTerm);

  return (
    <Panel>
      <PanelHeader>
        {/* <h2>Instruments</h2> */}
        <InstrumentSearch />
      </PanelHeader>
      <PanelContent>
        {/* <HStack gap={1} paddingInline="2">
        </HStack> */}
        {!instruments && <VStack>No Instruments</VStack>}
        {instruments && (
          <InstrumentsTable account={account} instruments={instruments} />
        )}
      </PanelContent>
    </Panel>
  );
}

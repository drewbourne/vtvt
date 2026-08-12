import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { AccountsTable } from "./AccountsTable";
import { Account } from "@fbt/accounts/models";
import { VStack } from "@styled-system/jsx";

export async function AccountsPanel({ accounts }: { accounts: Account[] }) {
  return (
    <Panel>
      <PanelHeader>
        <h2>Accounts</h2>
      </PanelHeader>
      <PanelContent>
        {!accounts && <VStack>No Accounts</VStack>}
        {accounts && <AccountsTable accounts={accounts} />}
      </PanelContent>
    </Panel>
  );
}

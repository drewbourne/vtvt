import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { AccountsTable } from "./AccountsTable";
import { VStack } from "@styled-system/jsx";
import { runAction } from "@/next/runAction";
import { getAccountsList } from "./getAccountsList";

export const AccountsPanel = runAction(
  { name: "AccountsPanel" },
  () => async () => {
    const accounts = await getAccountsList();

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
  },
);

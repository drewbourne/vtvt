import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { AccountsTable } from "./AccountsTable";

export async function AccountsPanel() {
  return (
    <Panel>
      <PanelHeader>
        <h2>Accounts</h2>
      </PanelHeader>
      <PanelContent>
        <AccountsTable />
      </PanelContent>
    </Panel>
  );
}

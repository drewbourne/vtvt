import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { WatchlistTable } from "./WatchlistTable";

export function WatchlistPanel() {
  return (
    <Panel>
      <PanelHeader>
        <h2>Watchlist</h2>
      </PanelHeader>
      <PanelContent>
        <WatchlistTable />
      </PanelContent>
    </Panel>
  );
}

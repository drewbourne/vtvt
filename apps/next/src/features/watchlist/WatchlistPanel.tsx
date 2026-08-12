"use client";

import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { WatchlistTable } from "./WatchlistTable";
import { WatchlistEntry } from "@fbt/watchlist/models";
import { useWatchlistQuotes } from "./useWatchlistQuotes";

export function WatchlistPanel({
  entries,
  // quotes,
}: {
  entries: WatchlistEntry[];
  // quotes: Map<InstrumentId, MarketQuote>;
}) {
  const quotes = useWatchlistQuotes(entries);

  return (
    <Panel>
      <PanelHeader>
        <h2>Watchlist</h2>
      </PanelHeader>
      <PanelContent>
        <WatchlistTable entries={entries} quotes={quotes} />
      </PanelContent>
    </Panel>
  );
}

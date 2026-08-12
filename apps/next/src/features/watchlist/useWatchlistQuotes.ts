"use client";

import { InstrumentId, MarketQuote } from "@fbt/market/models";
import { WatchlistEntry } from "@fbt/watchlist/models";
import { useEffect, useState } from "react";
import { useSSE } from "use-next-sse";

export function useWatchlistQuotes(watchlistEntries: WatchlistEntry[]) {
  const [quotes, setQuotes] = useState<Map<InstrumentId, MarketQuote>>(
    new Map(),
  );

  const searchParams = new URLSearchParams();

  for (const entry of watchlistEntries) {
    searchParams.append("instrumentId", entry.instrumentId);
  }

  const { data, error } = useSSE({
    url: `/api/quotes?${searchParams}`,
    eventName: "quote",
    reconnect: true,
  });

  useEffect(() => {
    if (data) {
      const lastQuote = quotes.get(data.instrumentId);
      const nextQuote = { ...lastQuote, ...data };
      const nextQuotes = new Map(quotes);
      nextQuotes.set(data.instrumentId, nextQuote);
      setQuotes(nextQuotes);
    }
  }, [data, error]);

  return quotes;
}

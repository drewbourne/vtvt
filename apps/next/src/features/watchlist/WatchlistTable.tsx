import { Price } from "@/ui/price/Price";
import { Table, TableLayout, Tbody, Td, Th, Thead, Tr } from "@/ui/table/Table";
import { InstrumentId, MarketQuote } from "@fbt/market/models";
import { WatchlistEntry } from "@fbt/watchlist/models";

export interface WatchlistTableProps {
  entries: WatchlistEntry[];
  quotes: Map<InstrumentId, MarketQuote>;
}

export function WatchlistTable({ entries, quotes }: WatchlistTableProps) {
  return (
    <TableLayout>
      <Table>
        <Thead>
          <Tr>
            <Th scope="col" cellKind="broker">
              Broker
            </Th>
            <Th scope="col" cellKind="symbol">
              Symbol
            </Th>
            <Th scope="col" cellKind="number">
              Bid
            </Th>
            <Th scope="col" cellKind="number">
              Ask
            </Th>
            <Th scope="col" cellKind="number">
              Spread
            </Th>
            <Th scope="col" cellKind="number">
              Last Price
            </Th>
            <Th scope="col" cellKind="number">
              Volume
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => {
            const quote = quotes.get(entry.instrumentId);

            return (
              <Tr key={entry.instrumentId}>
                <Td cellKind="broker">{entry.brokerId}</Td>
                <Td cellKind="symbol">{entry.symbol}</Td>
                <Td cellKind="number">
                  <Price value={quote?.bestBid} />
                </Td>
                <Td cellKind="number">
                  <Price value={quote?.bestAsk} />
                </Td>
                <Td cellKind="number">
                  {(quote?.bestAsk ?? 0) - (quote?.bestBid ?? 0)}
                </Td>
                <Td cellKind="number">
                  <Price value={quote?.lastPrice} />
                </Td>
                <Td cellKind="number">{quote?.volume ?? 0}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableLayout>
  );
}

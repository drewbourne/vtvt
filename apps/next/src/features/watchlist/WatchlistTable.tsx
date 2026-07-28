import { Table, Th, Thead, Tr } from "@/ui/table/Table";

export function WatchlistTable() {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Broker</Th>
          <Th>Symbol</Th>
          <Th>Bid</Th>
          <Th>Ask</Th>
          <Th>Spread</Th>
          <Th>Volume</Th>
        </Tr>
      </Thead>
    </Table>
  );
}

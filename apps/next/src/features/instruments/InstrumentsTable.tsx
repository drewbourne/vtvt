import { Button } from "@/ui/button/Button";
import { Table, TableLayout, Tbody, Td, Th, Thead, Tr } from "@/ui/table/Table";
import { Instrument } from "@fbt/market/models";
import { addInstrumentToWatchlist } from "./addInstrumentToWatchlist";
import { Account } from "@fbt/accounts/models";

export function InstrumentsTable({
  account,
  instruments,
}: {
  account: Account | null;
  instruments: Instrument[];
}) {
  return (
    <TableLayout>
      <Table>
        <Thead>
          <Tr>
            <Th cellKind="broker">Broker</Th>
            <Th cellKind="text" cellWidth="sm">
              Type
            </Th>
            <Th cellKind="symbol">Symbol</Th>
            {/* <Th cellKind="text">Name</Th> */}
            <Th cellKind="text">Description</Th>
            <Th cellKind="action" cellWidth="sm">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {instruments.map((instrument) => {
            return (
              <Tr key={instrument.id}>
                <Td cellKind="broker">{instrument.brokerId}</Td>
                <Td cellKind="text" cellWidth="sm">
                  {instrument.instrumentType}
                </Td>
                <Td cellKind="symbol">{instrument.symbol}</Td>
                {/* <Td cellKind="text">{instrument.name}</Td> */}
                <Td cellKind="text">{instrument.description}</Td>
                <Td cellKind="action" cellWidth="sm">
                  <form action={addInstrumentToWatchlist}>
                    <input type="hidden" name="accountId" value={account.id} />
                    <input
                      type="hidden"
                      name="instrumentId"
                      value={instrument.id}
                    />
                    <Button disabled={!account}>Add</Button>
                  </form>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableLayout>
  );
}

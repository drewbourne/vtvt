import { Table, Th, Thead, Tr } from "@/ui/table/Table";

export function AccountsTable() {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Broker</Th>
          <Th>Account</Th>
          <Th>Balance</Th>
        </Tr>
      </Thead>
    </Table>
  );
}

import { Table, TableLayout, Tbody, Td, Th, Thead, Tr } from "@/ui/table/Table";
import { Account } from "@fbt/accounts/models";

export function AccountsTable({ accounts }: { accounts: Account[] }) {
  return (
    <TableLayout>
      <Table>
        <Thead>
          <Tr>
            <Th cellKind="broker">Broker</Th>
            <Th cellKind="text">Account</Th>
            <Th cellKind="text">Name</Th>
            <Th cellKind="price">Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {accounts.map((account) => {
            return (
              <Tr key={account.id}>
                <Td cellKind="broker">{account.brokerId}</Td>
                <Td cellKind="text">{account.brokerAccountId}</Td>
                <Td cellKind="text">{account.name}</Td>
                <Td cellKind="number">{account.balance}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableLayout>
  );
}

import { Table, TableLayout, Tbody, Td, Th, Thead, Tr } from "@/ui/table/Table";
import { ServiceStats } from "nats";

export function ServicesTable({ services }: { services: ServiceStats[] }) {
  return (
    <TableLayout>
      <Table>
        <Thead>
          <Tr>
            <Th cellKind="text">Name</Th>
            <Th cellKind="text">Version</Th>
            {/* <Th cellKind="text">Started</Th> */}
            <Th cellKind="text">Endpoint</Th>
            <Th cellKind="number">Requests</Th>
            <Th cellKind="number">Errors</Th>
            {/* <Th cellKind="number">Last Error</Th> */}
            <Th cellKind="number">
              <abbr title="Processing Time">PT</abbr>
            </Th>
            <Th cellKind="number">
              <abbr title="Average Processing Time">Avg. PT</abbr>
            </Th>
          </Tr>
        </Thead>
        {services.map((service) => {
          return (
            <Tbody key={service.id}>
              <Tr key={service.id}>
                <Td cellKind="text">{service.name}</Td>
                <Td cellKind="text">{service.version}</Td>
                {/* <Td cellKind="datetime">{service.started}</Td> */}
                <Td cellKind="text">{service.endpoints?.length ?? 0}</Td>
                <Td colSpan={4}></Td>
              </Tr>
              {service.endpoints?.map((endpoint) => (
                <Tr key={endpoint.name}>
                  <Td></Td>
                  <Td></Td>
                  {/* <Td></Td> */}
                  <Td cellKind="text">{endpoint.name}</Td>
                  <Td cellKind="number">{endpoint.num_requests}</Td>
                  <Td cellKind="number">{endpoint.num_errors}</Td>
                  {/* <Td cellKind="number">{endpoint.last_error}</Td> */}
                  <Td cellKind="number">{endpoint.processing_time}</Td>
                  <Td cellKind="number">{endpoint.average_processing_time}</Td>
                </Tr>
              ))}
            </Tbody>
          );
        })}
      </Table>
    </TableLayout>
  );
}

"use client";

import { Panel, PanelContent, PanelHeader } from "@/ui/panel/Panel";
import { ServicesTable } from "./ServicesTable";
import { VStack } from "@styled-system/jsx";
import { useServiceStats } from "./useServiceStats";

export function ServicesPanel() {
  const { services, error } = useServiceStats();

  return (
    <Panel>
      <PanelHeader>
        <h2>Services</h2>
      </PanelHeader>
      <PanelContent>
        {error && <VStack>Error retrieving service stats</VStack>}
        {!error && !services && <VStack>No Services</VStack>}
        {services && <ServicesTable services={services} />}
      </PanelContent>
    </Panel>
  );
}

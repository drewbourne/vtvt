"use client";

import { useEffect, useMemo, useState } from "react";
import { useSSE } from "use-next-sse";
import { type ServiceStats } from "nats";
import { ServicesEventMap } from "./ServicesClient";

export function useServiceStats() {
  const { data, error } = useSSE({
    url: `/api/services`,
    eventName: "stats",
    reconnect: true,
  });

  console.log("useServiceStats", data);

  const [statsMap, setStatsMap] = useState(new Map<string, ServiceStats>());

  useEffect(() => {
    if (!data) return;

    setStatsMap((prev) => {
      const event = data as ServicesEventMap["onStats"];
      const { value: stats } = event;
      stats.endpoints?.sort((a, b) => a.name.localeCompare(b.name));
      return new Map(prev).set(stats.id, stats);
    });
  }, [data, error]);

  const services = useMemo(
    () =>
      Array.from(statsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [statsMap],
  );

  return { services, error };
}

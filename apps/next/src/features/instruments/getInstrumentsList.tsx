import { runAction } from "@/next/runAction";
import { cache } from "react";

export const getInstrumentsList = cache(
  runAction(
    { name: "getInstrumentsList" },
    ({ instrumentsClient }) =>
      async (searchTerm?: string) => {
        if (!searchTerm) return null;

        const result = await instrumentsClient.listInstruments({
          filters: [{ field: "name", op: "includes", value: searchTerm }],
          sorts: [{ field: "name", sort: "asc", nulls: "last" }],
          limit: 10,
        });

        if (result.status === "success" && result.count > 0) {
          return result.items;
        }

        return null;
      },
  ),
);

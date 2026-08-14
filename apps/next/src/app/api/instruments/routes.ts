import { runAction } from "@/next/runAction";
import { NextRequest } from "next/server";
import * as z from "zod";

export const runtime = "nodejs";

const Field = z.enum(["symbol", "name"]);
const Value = z.string();

export const GET = runAction(
  { name: "GET /instruments" },
  ({ instrumentsClient }) =>
    async (req: NextRequest) => {
      const fieldData = req.nextUrl.searchParams.get("field") ?? "symbol";
      const field = Field.parse(fieldData);

      const valueData = req.nextUrl.searchParams.get("value") ?? "";
      const value = Value.parse(valueData);

      if (!value) {
        return Response.json({ status: "success", count: 0, items: [] });
      }

      const result = await instrumentsClient.listInstruments({
        filters: [{ field, op: "eq", value }],
        sorts: [{ field, sort: "asc", nulls: "last" }],
        limit: 10,
      });

      return Response.json(result);
    },
);

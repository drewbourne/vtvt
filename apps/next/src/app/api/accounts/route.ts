import { runAction } from "@/next/runAction";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const GET = runAction(
  { name: "GET /api/accounts" },
  ({ logger, accountsClient }) =>
    async (request: NextRequest) => {
      logger.info("requesting accounts", { request });

      const result = await accountsClient.listAccounts({
        filters: {},
        sorts: {},
        offset: 0,
        limit: 10,
      });

      logger.info("received accounts", result);

      return Response.json({});
    },
);

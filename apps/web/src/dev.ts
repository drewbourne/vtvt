import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { AccountId } from "@fbt/accounts/models";
import { webContainer } from "./container.js";

const { loggerBase: logger, service } = webContainer.cradle;

async function main() {
  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: getPrettyFormatter({ properties: true }),
      }),
    },
    loggers: [
      {
        category: ["logtape", "meta"],
        lowestLevel: "warning",
        sinks: ["console"],
      },
      {
        category: [service],
        lowestLevel: "debug",
        sinks: ["console"],
      },
    ],
  });

  const { accountsClient, watchlistClient } = webContainer.cradle;

  // TODO wait for accounts service worker to be available

  setInterval(async () => {
    const accounts = await accountsClient.listAccounts({
      filters: {},
      sorts: {},
      offset: 0,
      limit: 1,
    });

    logger.info("accounts", accounts);

    const watchlist = await watchlistClient.getWatchlistForAccount({
      accountId: AccountId.parse("blahblah"),
    });

    logger.info("watchlist", watchlist);
  }, 3_000);
}

main().catch((error) => logger.error(error));

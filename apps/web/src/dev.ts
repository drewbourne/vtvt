import { getLogger, configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { NatsService } from "@fbt/nats";
import { AccountsServiceClient } from "@fbt/accounts";
import { WatchlistServiceClient } from "@fbt/watchlist";
import { AccountId } from "@fbt/accounts/models";

const name = "@fbt/web";
const logger = getLogger([name]);

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
      { category: name, lowestLevel: "debug", sinks: ["console"] },
    ],
  });
  logger.info("logging configured");

  const nats = new NatsService(logger.getChild("nats"));
  logger.info("nats created");

  const accountsClient = new AccountsServiceClient(
    logger.getChild("accounts"),
    nats,
  );
  logger.info("accountsClient created");

  const watchlistClient = new WatchlistServiceClient(
    logger.getChild("watchlist"),
    nats,
  );
  logger.info("watchlistClient created");

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

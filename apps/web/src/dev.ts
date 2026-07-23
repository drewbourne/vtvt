import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { Account, AccountId, BrokerId } from "@fbt/accounts/models";
import { webContainer } from "./container.js";
import { BrokerSymbolId, Symbol } from "@fbt/market/models";

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

  // FIXME wait for services to announce liveness, readiness
  logger.debug("waiting for services to start...");
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  // const accounts = await checkAccounts();

  // const watchlist = await checkWatchlists(account);

  await checkInstruments();
}

main().catch((error) => logger.error(error));

async function checkAccounts() {
  const { accountsClient } = webContainer.cradle;

  const accounts = await accountsClient.listAccounts({
    filters: {},
    sorts: {},
    offset: 0,
    limit: 1,
  });

  logger.info("accounts", accounts);

  return accounts;
}

async function checkWatchlists(account: Account) {
  logger.info("checkWatchlists start");

  const { watchlistClient } = webContainer.cradle;
  let watchlist = await watchlistClient.getWatchlistForAccount({
    accountId: account.id,
  });
  logger.info("watchlist", watchlist);

  // watchlistClient.addSymbolToWatchlist({
  //   accountId: account.id,
  //   symbol: Symbol.parse("MNQ"),
  //   brokerId: account.brokerId,
  //   brokerSymbolId: BrokerSymbolId.parse("CON.F.US.MNQ.U6"),
  // });
  // watchlist = await watchlistClient.getWatchlistForAccount({
  //   accountId: account.id,
  // });
  // logger.info("watchlist", watchlist);

  return watchlist;
}

async function checkInstruments() {
  logger.info("checkInstruments start");

  const { instrumentsClient } = webContainer.cradle;

  const instruments = await instrumentsClient.listInstruments({
    filters: [{ field: "name", op: "startsWith", value: "MNQ" }],
    sorts: [],
    limit: 10,
  });

  logger.info("instruments", instruments);

  return instruments;
}

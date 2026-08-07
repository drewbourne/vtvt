import { configureLogging } from "@fbt/logging";
import { Account, AccountId, BrokerId } from "@fbt/accounts/models";
import { webContainer } from "./container.js";
import { BrokerSymbolId, Instrument, Symbol } from "@fbt/market/models";
import { SpanKind, trace } from "@opentelemetry/api";
import { Watchlist } from "@fbt/watchlist/models";

const { loggerBase: logger, service, version } = webContainer.cradle;

const tracer = trace.getTracer(service);

main().catch((error) => logger.error(error));

async function main() {
  tracer.startActiveSpan("main", async () => {
    await configureLogging({ service });

    // FIXME wait for services to announce liveness, readiness
    logger.debug("waiting for services to start...");
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // await checkClients();
    // await checkSystem();

    await checkServices();

    const accounts = await checkAccounts();
    if (accounts.count === 0) {
      logger.error("no accounts");
      process.exit(1);
    }

    const account = accounts.items[0];
    if (!account) {
      logger.error("no account", account);
      process.exit(1);
    }

    // const watchlist = await checkWatchlists(account);

    const instruments = await checkInstruments();
    if (instruments.status === "success" && instruments.items.length > 0) {
      await checkPricesForInstrument(instruments.items[0]!);
    }
  });
}

async function checkClients() {
  const client1 = webContainer.cradle.natsClient;
  await client1.connect();
  client1.subscribe("fbt.web.rpc.client1", {}, async (msg) => {
    logger.info(`client 1 received: ${msg.subject}`, {
      payload: msg.json(),
      headers: msg.headers,
    });
    msg.respond(JSON.stringify({ replyFrom: "client1" }));
  });

  const client2 = webContainer.cradle.natsClient;
  await client2.connect();
  const msg = await client2.request(
    "fbt.web.rpc.client1",
    JSON.stringify({ sentFrom: "client2" }),
  );
  logger.info(`client2 received reply: ${msg?.subject}`, {
    payload: msg?.json(),
    headers: msg?.headers,
  });
}

async function checkSystem() {}

async function checkServices() {
  return tracer.startActiveSpan("checkServices", async () => {
    const { nats } = webContainer.cradle;

    const nc = await nats.connect();
    const sc = nc.services.client();

    logger.info("checking services");

    let iter = await sc.ping();
    logger.debug("results from PING");
    for await (const si of iter) {
      logger.debug("PING", { ...si });
    }

    // iter = await sc.info();
    // logger.debug("results from INFO");
    // for await (const i of iter) {
    //   logger.debug("INFO", { ...i });
    // }

    // iter = await sc.stats();
    // logger.debug("results from STATS");
    // for await (const si of iter) {
    //   logger.debug("STATS", { ...si });
    // }
  });
}

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
  let result = await watchlistClient.getWatchlistForAccount({
    accountId: account.id,
  });

  logger.info("watchlist", result);

  if (result.status === "success") {
    return result;
  }

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

  return null;
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

async function checkPricesForInstrument(instrument: Instrument) {
  logger.info("checkPricesForInstrument start");

  const { livePricesClient } = webContainer.cradle;

  await livePricesClient.subscribeQuotesForInstrument(
    {
      instrument,
    },
    async ({ quote }) => {
      logger.info("checkPricesForInstrument quote", { quote });
    },
  );
}

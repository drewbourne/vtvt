import { getLogger, configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { WatchlistService } from "./service.js";
import { WatchlistServiceWorker } from "./worker.js";
import { NatsService } from "@fbt/nats";

const name = "@fbt/watchlist";
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

  const watchlistService = new WatchlistService(
    logger.getChild("watchlistService"),
  );
  logger.info("watchlistService created");

  const worker = new WatchlistServiceWorker(
    watchlistService,
    logger.getChild("worker"),
    nats,
  );
  logger.info("worker created");

  logger.info("worker starting");
  await worker.start();

  logger.info("worker started");
}

main().catch((error) => logger.error(error));

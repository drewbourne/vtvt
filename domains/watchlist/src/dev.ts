import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { watchlistWorkerContainer } from "./container.js";

const { loggerBase: logger } = watchlistWorkerContainer.cradle;

async function main() {
  const { service } = watchlistWorkerContainer.cradle;

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

  const { watchlistWorker } = watchlistWorkerContainer.cradle;

  logger.info("watchlistWorker starting");

  await watchlistWorker.start();

  logger.info("watchlistWorker started");
}

main().catch((error) => logger.error(error));

import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { topstepWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = topstepWorkerContainer.cradle;

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

  // accounts
  const { accountsWorker } = topstepWorkerContainer.cradle;
  logger.info("accountsWorker starting");
  await accountsWorker.start();
  logger.info("accountsWorker started");

  // instruments
  const { instrumentsWorker } = topstepWorkerContainer.cradle;
  logger.info("instrumentsWorker starting");
  await instrumentsWorker.start();
  logger.info("instrumentsWorker started");

  // market

  // trading
}

main().catch((error) => logger.error(error));

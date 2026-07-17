import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { accountsWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = accountsWorkerContainer.cradle;

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

  const { accountsWorker } = accountsWorkerContainer.cradle;

  logger.info("accountsWorker starting");

  await accountsWorker.start();

  logger.info("accountsWorker started");
}

main().catch((error) => logger.error(error));

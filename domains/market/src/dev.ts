import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { marketWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = marketWorkerContainer.cradle;

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

  const { instrumentsWorker } = marketWorkerContainer.cradle;
  logger.info("instrumentsWorker starting");

  await instrumentsWorker.start();
  logger.info("instrumentsWorker started");
}

main().catch((error) => logger.error(error));

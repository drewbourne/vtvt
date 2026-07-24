import { configureLogging } from "@fbt/logging";
import { watchlistWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = watchlistWorkerContainer.cradle;

async function main() {
  await configureLogging({ service });

  const { watchlistWorker } = watchlistWorkerContainer.cradle;

  logger.info("watchlistWorker starting");

  await watchlistWorker.start();

  logger.info("watchlistWorker started");
}

main().catch((error) => logger.error(error));

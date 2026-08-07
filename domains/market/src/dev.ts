import { configureLogging } from "@fbt/logging";
import { marketWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = marketWorkerContainer.cradle;

async function main() {
  await configureLogging({ service });

  const { instrumentsWorker } = marketWorkerContainer.cradle;
  logger.info("instrumentsWorker starting");
  await instrumentsWorker.start();
  logger.info("instrumentsWorker started");

  const { livePricesWorker } = marketWorkerContainer.cradle;
  logger.info("livePricesWorker starting");
  await livePricesWorker.start();
  logger.info("livePricesWorker started");
}

main().catch((error) => logger.error(error));

import { configureLogging } from "@fbt/logging";
import { systemWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = systemWorkerContainer.cradle;

async function main() {
  await configureLogging({ service });

  const { systemWorker } = systemWorkerContainer.cradle;

  logger.info("systemWorker starting");

  await systemWorker.start();

  logger.info("systemWorker started");
}

main().catch((error) => logger.error(error));

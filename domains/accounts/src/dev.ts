import { configureLogging } from "@fbt/logging";
import { getPrettyFormatter } from "@logtape/pretty";
import { accountsWorkerContainer } from "./container.js";

const { loggerBase: logger, service } = accountsWorkerContainer.cradle;

async function main() {
  await configureLogging({ service });

  const { accountsWorker } = accountsWorkerContainer.cradle;
  logger.info("accountsWorker starting");

  await accountsWorker.start();
  logger.info("accountsWorker started");
}

main().catch((error) => logger.error(error));

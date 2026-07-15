import { getLogger, configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { AccountsService } from "./service.js";
import { AccountsServiceWorker } from "./worker.js";
import { NatsService } from "@fbt/nats";

const name = "@fbt/accounts";
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

  const accountsService = new AccountsService(
    logger.getChild("accountsService"),
  );
  logger.info("accountsService created");

  const worker = new AccountsServiceWorker(
    accountsService,
    logger.getChild("worker"),
    nats,
  );
  logger.info("worker created");

  logger.info("worker starting");
  await worker.start();

  logger.info("worker started");
}

main().catch((error) => logger.error(error));

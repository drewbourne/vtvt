import { getLogger, configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { NatsService } from "@fbt/nats";

const name = "@fbt/market";
const logger = getLogger(name);

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

  // TODO start worker
}

main().catch((error) => logger.error(error));

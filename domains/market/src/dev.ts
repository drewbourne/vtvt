import { configure, getConsoleSink } from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { marketContainer } from "./container.js";

const { loggerBase: logger, service } = marketContainer.cradle;

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

  // TODO start worker
}

main().catch((error) => logger.error(error));

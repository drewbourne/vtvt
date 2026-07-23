import { NatsService } from "@fbt/nats";
import { WatchlistService } from "./WatchlistService.js";
import { Logger } from "@logtape/logtape";
import { GetWatchlistForAccountOperation } from "../operations/GetWatchlistForAccountOperation.js";
import { AddSymbolToWatchlistOperation } from "../operations/AddSymbolToWatchlistOperation.js";
import { RemoveSymbolFromWatchlistOperation } from "../operations/RemoveSymbolFromWatchlistOperation.js";

const operations = [
  GetWatchlistForAccountOperation,
  AddSymbolToWatchlistOperation,
  RemoveSymbolFromWatchlistOperation,
];

export class WatchlistServiceWorker {
  constructor(
    private watchlistService: WatchlistService,
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async start() {
    this.logger.info("start");

    this.subscribeOperations();
  }

  async subscribeOperations() {
    this.logger.info("subscribeOperations", {
      operations: operations.map((o) => `${o.subject} -> ${o.method}`),
    });

    for await (const operation of operations) {
      this.nats.subscribeOperation(
        operation,
        {},
        // @ts-expect-error
        async (request) => {
          // @ts-expect-error
          return this.watchlistService[operation.method](request);
        },
      );
    }
  }
}

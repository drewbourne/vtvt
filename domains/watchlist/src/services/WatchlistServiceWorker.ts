import { NatsServiceWorker } from "@fbt/nats";
import { WatchlistService } from "./WatchlistService.js";
import { Logger } from "@logtape/logtape";
import { GetWatchlistForAccountOperation } from "../operations/GetWatchlistForAccountOperation.js";
import { AddSymbolToWatchlistOperation } from "../operations/AddSymbolToWatchlistOperation.js";
import { RemoveSymbolFromWatchlistOperation } from "../operations/RemoveSymbolFromWatchlistOperation.js";

export class WatchlistServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private watchlistService: WatchlistService,
  ) {}

  async start() {
    this.logger.info("start");

    await this.natsServiceWorker.addService(
      {
        name: `fbt.watchlist`,
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: {},
      },
      [
        this.natsServiceWorker.handler(
          GetWatchlistForAccountOperation,
          {},
          async ({ params }) => {
            return this.watchlistService.getWatchlistForAccount(params);
          },
        ),
        this.natsServiceWorker.handler(
          AddSymbolToWatchlistOperation,
          {},
          async ({ params }) => {
            return this.watchlistService.addSymbolToWatchlist(params);
          },
        ),
        this.natsServiceWorker.handler(
          RemoveSymbolFromWatchlistOperation,
          {},
          async ({ params }) => {
            return this.watchlistService.removeSymbolFromWatchlist(params);
          },
        ),
      ],
    );
  }
}

import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import {
  GetWatchlistForAccountOperation,
  GetWatchlistForAccountRequest,
  GetWatchlistForAccountResult,
} from "../operations/GetWatchlistForAccountOperation.js";
import {
  AddSymbolToWatchlistOperation,
  AddSymbolToWatchlistRequest,
  AddSymbolToWatchlistResult,
} from "../operations/AddSymbolToWatchlistOperation.js";
import {
  RemoveSymbolFromWatchlistOperation,
  RemoveSymbolFromWatchlistRequest,
  RemoveSymbolFromWatchlistResult,
} from "../operations/RemoveSymbolFromWatchlistOperation.js";
import { ServiceOperation } from "@fbt/service";

export class WatchlistServiceClient {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async getWatchlistForAccount(
    request: GetWatchlistForAccountRequest,
  ): Promise<GetWatchlistForAccountResult> {
    const result = await this.nats.requestOperation(
      request,
      GetWatchlistForAccountOperation,
    );

    this.logger.info("getWatchlistForAccount", { request, result });

    return result;
  }

  async addSymbolToWatchlist(
    request: AddSymbolToWatchlistRequest,
  ): Promise<AddSymbolToWatchlistResult> {
    const result = await this.nats.requestOperation(
      request,
      AddSymbolToWatchlistOperation,
    );

    this.logger.info("addSymbolToWatchlist", { request, result });

    return result;
  }

  async removeSymbolFromWatchlist(
    request: RemoveSymbolFromWatchlistRequest,
  ): Promise<RemoveSymbolFromWatchlistResult> {
    const result = await this.nats.requestOperation(
      request,
      RemoveSymbolFromWatchlistOperation,
    );

    this.logger.info("removeSymbolFromWatchlist", { request, result });

    return result;
  }
}

import { Logger } from "@logtape/logtape";
import {
  GetWatchlistForAccountRequest,
  GetWatchlistForAccountResult,
} from "../operations/GetWatchlistForAccountOperation.js";
import {
  AddSymbolToWatchlistRequest,
  AddSymbolToWatchlistResult,
} from "../operations/AddSymbolToWatchlistOperation.js";
import {
  RemoveSymbolFromWatchlistRequest,
  RemoveSymbolFromWatchlistResult,
} from "../operations/RemoveSymbolFromWatchlistOperation.js";

export class WatchlistService {
  constructor(private logger: Logger) {}

  async getWatchlistForAccount(
    request: GetWatchlistForAccountRequest,
  ): Promise<GetWatchlistForAccountResult> {
    const result: GetWatchlistForAccountResult = {
      count: 0,
      total: 0,
      items: [],
    };

    this.logger.info("getWatchlistForAccount", {
      request,
      result,
    });

    return result;
  }

  async addSymbolToWatchlist(
    request: AddSymbolToWatchlistRequest,
  ): Promise<AddSymbolToWatchlistResult> {
    return { status: "success" };
  }

  async removeSymbolFromWatchlist(
    request: RemoveSymbolFromWatchlistRequest,
  ): Promise<RemoveSymbolFromWatchlistResult> {
    return { status: "success" };
  }
}

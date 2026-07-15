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
    const data = GetWatchlistForAccountRequest.parse(request);
    const msg = JSON.stringify(data);
    const res = await this.nats.request(
      GetWatchlistForAccountOperation.subject,
      msg,
    );
    const result = GetWatchlistForAccountResult.parse(res.json());

    this.logger.info("getWatchlistForAccount", { request, result });

    return result;
  }

  async addSymbolToWatchlist(
    request: AddSymbolToWatchlistRequest,
  ): Promise<AddSymbolToWatchlistResult> {
    const data = AddSymbolToWatchlistRequest.parse(request);
    const msg = JSON.stringify(data);
    const res = await this.nats.request(
      AddSymbolToWatchlistOperation.subject,
      msg,
    );
    const result = AddSymbolToWatchlistResult.parse(res.json());

    this.logger.info("addSymbolToWatchlist", { request, result });

    return result;
  }

  async removeSymbolFromWatchlist(
    request: RemoveSymbolFromWatchlistRequest,
  ): Promise<RemoveSymbolFromWatchlistResult> {
    const data = RemoveSymbolFromWatchlistRequest.parse(request);
    const msg = JSON.stringify(data);
    const res = await this.nats.request(
      RemoveSymbolFromWatchlistOperation.subject,
      msg,
    );
    const result = RemoveSymbolFromWatchlistResult.parse(res.json());

    this.logger.info("removeSymbolFromWatchlist", { request, result });

    return result;
  }
}

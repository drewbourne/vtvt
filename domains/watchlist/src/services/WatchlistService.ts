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
import { QuestService } from "@fbt/quest";
import { Watchlist } from "../models.js";

export class WatchlistService {
  constructor(
    private logger: Logger,
    private quest: QuestService,
  ) {}

  async getWatchlistForAccount(
    request: GetWatchlistForAccountRequest,
  ): Promise<GetWatchlistForAccountResult> {
    const sql = this.quest.sql();

    try {
      const rows = await sql`
        SELECT (accountId, symbol, brokerId, brokerSymbolId)
        FROM watchlist_symbols
        WHERE accountId=${request.accountId}`;

      const items = rows.map((row) => Watchlist.parse(row));

      const result: GetWatchlistForAccountResult = {
        status: "success",
        count: items.length,
        total: items.length,
        items,
      };

      this.logger.info("getWatchlistForAccount", {
        request,
        result,
      });

      return result;
    } catch (error) {
      this.logger.error(`getWatchlistForAccount error`, { error });
      this.logger.error(error as Error);

      return { status: "failure", error };
    }
  }

  async addSymbolToWatchlist(
    request: AddSymbolToWatchlistRequest,
  ): Promise<AddSymbolToWatchlistResult> {
    try {
      const sender = await this.quest.createSender();

      sender
        .table("watchlist_symbols")
        .symbol("accountId", request.accountId)
        .symbol("symbol", request.symbol)
        .symbol("brokerId", request.brokerId)
        .symbol("brokerSymbolId", request.brokerSymbolId)
        .atNow();

      await sender.flush();
      await sender.close();

      return { status: "success" };
    } catch (error) {
      this.logger.error(`addSymbolToWatchlist error`, { error });
      this.logger.error(error as Error);

      return { status: "failure", error };
    }
  }

  async removeSymbolFromWatchlist(
    request: RemoveSymbolFromWatchlistRequest,
  ): Promise<RemoveSymbolFromWatchlistResult> {
    const sql = this.quest.sql();

    try {
      await sql`
        DELETE FROM watchlist_symbols 
        WHERE accountId=${request.accountId} 
          AND symbol=${request.symbol}
          AND brokerId=${request.brokerId}
        LIMIT 1
      `;

      return { status: "success" };
    } catch (error) {
      this.logger.error(`removeSymbolFromWatchlist error`, { error });
      this.logger.error(error as Error);

      return { status: "failure", error };
    }
  }
}

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
import { WatchlistEntry } from "../models/WatchlistEntry.js";

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
        SELECT accountId, instrumentId, symbol, brokerId, brokerSymbolId
        FROM watchlist_entries
        WHERE accountId=${request.accountId}`;

      this.logger.debug("rows", { rows });

      const parsed = rows.map((row) => WatchlistEntry.safeParse(row));

      const items = parsed
        .filter((result) => result.success)
        .map((result) => result.data);

      const itemsWithErrors = parsed.filter((result) => !result.success);
      this.logger.error("items with errors were excluded from results", {
        itemsWithErrors,
      });

      const result: GetWatchlistForAccountResult = {
        status: "success",
        count: items.length,
        items,
      };

      this.logger.debug("getWatchlistForAccount", {
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
        .table("watchlist_entries")
        .symbol("accountId", request.accountId)
        .symbol("instrumentId", request.instrumentId)
        .symbol("symbol", request.symbol)
        .symbol("brokerId", request.brokerId)
        .symbol("brokerSymbolId", request.brokerSymbolId)
        .atNow();

      await sender.flush();
      await sender.close();

      this.logger.debug("addSymbolToWatchlist success", { request });

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
        DELETE FROM watchlist_entries 
        WHERE accountId=${request.accountId} 
          AND instrumentId=${request.instrumentId}
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

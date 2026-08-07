import { Logger } from "@logtape/logtape";
import { TopstepMarketHubClient } from "./TopstepMarketHubClient.js";
import { MapWithCallbacks } from "@fbt/primitives";
import { Instrument, MarketQuote } from "@fbt/market/models";
import { HubConnection } from "@microsoft/signalr";

export type GatewayQuote = {
  symbol: string; // 'F.US.MNQ',
  symbolName: string; // '/MNQ'
  lastPrice: number;
  bestBid: number; // 23028,
  bestAsk: number; // 23028.25,
  change: number; // 25.50
  changePercent: number; // 0.14
  open: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string; // '2025-07-17T02:23:38.6601255+00:00',
  timestamp: string; // '2025-07-17T02:23:38.584+00:00'
};

export type GatewayTrade = {
  symbolId: string; // 'F.US.MNQ',
  price: number; // 23028.5,
  timestamp: string; // '2025-07-17T02:33:32.356+00:00',
  type: number; // 1,
  volume: number; // 1
};

// export type GatewayDepth = {
//   price: number; // 23028,
//   volume: number; // 1,
//   currentVolume: number; // 0,
//   type: number; // 4,
//   timestamp: string; // '2025-07-17T02:23:38.6179388+00:00'
// };

export type GatewayHealth = {
  status: "healthy" | "stale";
  msSinceLastMessage: number;
};

type GatewayCallbacks = {
  onGatewayQuote?: (symbolId: string, quote: GatewayQuote) => void;
  onGatewayTrade?: (symbolId: string, trade: GatewayTrade[]) => void;
  // onGatewayDepth?: (symbolId: string, depth: GatewayDepth[]) => void;
  onGatewayHealth?: (symbolId: string, health: GatewayHealth) => void;
};

export class TopstepLivePricesService {
  private symbolSubs = new MapWithCallbacks<string, GatewayCallbacks>({
    onFirstAdded: () => this.start(),
    onFirstAddedForKey: (symbolId) =>
      this.subscribeSymbolOnConnection(symbolId),
    onLastRemovedForKey: (symbolId) =>
      this.unsubscribeSymbolOnConnection(symbolId),
    onLastRemoved: () => this.stop(),
  });

  private connection?: HubConnection;

  private heartbeatIntervalMs = 5_000;
  private heartbeatTimer?: NodeJS.Timeout;

  private staleThresholdMs = 15_000;
  private symbolTimestamps = new Map<string, { lastTs: number }>();

  constructor(
    private logger: Logger,
    private marketHub: TopstepMarketHubClient,
  ) {}

  public async subscribeInstrument(
    instrument: Instrument,
    subscriber: { onMarketQuote: (quote: MarketQuote) => void },
  ): Promise<() => Promise<void>> {
    this.logger.info("subscribeInstrument", {
      instrument,
    });

    const callbacks: GatewayCallbacks = {
      onGatewayQuote: (symbolId: string, gatewayQuote: GatewayQuote) => {
        try {
          const marketQuote: MarketQuote = {
            instrumentId: instrument.id,
            brokerId: instrument.brokerId,
            brokerSymbolId: instrument.brokerSymbolId,
            symbol: instrument.symbol,

            // FIXME add NY date time handlers
            // time: toNYDate(gatewayQuote.timestamp),
            time: gatewayQuote.timestamp,
            bestAsk: gatewayQuote.bestAsk,
            bestBid: gatewayQuote.bestBid,
            lastPrice: gatewayQuote.lastPrice,

            // FIXME only the first quote has these
            // they need to be maintained internally afterwards
            change: gatewayQuote.change,
            changePercent: gatewayQuote.changePercent,
            open: gatewayQuote.open,
            high: gatewayQuote.high,
            low: gatewayQuote.low,
            volume: gatewayQuote.volume,
          };

          this.logger.debug("onGatewayQuote", { gatewayQuote, marketQuote });

          subscriber.onMarketQuote?.(marketQuote);
        } catch (error) {
          this.logger.error(
            `subscribeInstrument onGatewayQuote symbolId: ${symbolId} error: ${error}`,
            { error },
          );

          // FIXME
          // handler(error, null);
        }
      },
    };

    await this.symbolSubs.add(instrument.brokerSymbolId, callbacks);

    return () => this.symbolSubs.remove(instrument.brokerSymbolId, callbacks);
  }

  private async start() {
    this.logger.debug("start");

    this.connection = await this.marketHub.connect();

    this.connection.on("GatewayQuote", this.onGatewayQuote);
    // this.connection.on("GatewayTrade", this.onGatewayTrade);

    this.connection.onreconnected(async () => {
      await this.resubscribeAllSymbolsToConnection();
    });

    this.connection.onclose(() => {
      this.stopHeartbeat();
    });

    this.startHeartbeat();
  }

  private async stop() {
    this.logger.debug("stop");

    if (this.connection) {
      this.unsubscribeAllSymbolsFromConnection();

      this.connection.off("GatewayQuote", this.onGatewayQuote);
      // this.connection.off("GatewayTrade", this.onGatewayTrade);
      this.connection = undefined;
    }

    await this.marketHub.disconnect();
  }

  private async resubscribeAllSymbolsToConnection() {
    this.logger.debug("resubscribeAllSymbolsToConnection");

    for (const symbolId of this.symbolSubs.keys()) {
      await this.subscribeSymbolOnConnection(symbolId);
    }
  }

  private async unsubscribeAllSymbolsFromConnection() {
    this.logger.debug("unsubscribeAllSymbolsFromConnection");

    for (const symbolId of this.symbolSubs.keys()) {
      await this.unsubscribeSymbolOnConnection(symbolId);
    }
  }

  private async subscribeSymbolOnConnection(symbolId: string) {
    this.logger.debug(`subscribeSymbolOnConnection symbolId: ${symbolId}`);
    // this.metrics.inc("px_market_symbol_subscribe_total", { symbolId });

    try {
      await this.connection!.invoke("SubscribeContractQuotes", symbolId);
      // await this.connection!.invoke("SubscribeContractTrades", symbolId);
      // await this.connection!.invoke("SubscribeContractMarketDepth", symbolId);
    } catch (error) {
      this.logger.error(`subscribeSymbolOnConnection symbolId: ${symbolId}`, {
        error,
      });
      //   this.logger.error(error);
      //   this.metrics.inc("px_market_symbol_subscribe_error_total", { symbolId });
    }
  }

  private async unsubscribeSymbolOnConnection(symbolId: string) {
    this.logger.debug(`unsubscribeSymbolOnConnection symbolId: ${symbolId}`);
    // this.metrics.inc("px_market_symbol_unsubscribe_total", { symbolId });

    try {
      await this.connection!.invoke("UnsubscribeContractQuotes", symbolId);
      // await this.connection!.invoke("UnsubscribeContractTrades", symbolId);
      // await this.connection!.invoke("UnsubscribeContractMarketDepth", symbolId);
    } catch (error) {
      this.logger.error(`unsubscribeSymbolOnConnection symbolId: ${symbolId}`, {
        error,
      });
      //   this.logger.error(error);
      //   this.metrics.inc("px_market_symbol_unsubscribe_error_total", {
      //     symbolId,
      //   });
    }
  }

  private startHeartbeat() {
    this.logger.debug("startHeartbeat");

    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();

      for (const [symbolId, info] of this.symbolTimestamps.entries()) {
        const subs = this.symbolSubs.values(symbolId);

        const delta = now - info.lastTs;
        const isStale = delta > this.staleThresholdMs;

        this.logger.debug("heartbeat", { symbolId, delta, isStale });

        if (isStale) {
          this.logger.debug(`stale market data for symbol: ${symbolId}`);
          //   this.metrics.inc("px_market_gateway_stale_total", { symbolId });
          //   this.metrics.ts("px_market_gateway_last_stale", { symbolId });

          for (const sub of subs) {
            sub.onGatewayHealth?.(symbolId, {
              status: "stale",
              msSinceLastMessage: delta,
            });
          }
        }
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat() {
    this.logger.debug("stopHeartbeat");

    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
  }

  private markAlive = (symbolId: string) => {
    const c = this.symbolTimestamps.get(symbolId);
    if (c) c.lastTs = Date.now();
  };

  private onGatewayQuote = (symbolId: string, quote: GatewayQuote) => {
    // this.logger.info(`onGatewayQuote symbolId: ${symbolId}`, quote);
    // this.metrics.inc("px_market_gateway_quote_total", { symbolId });

    this.markAlive(symbolId);

    this.symbolSubs.values(symbolId).forEach((callbacks) => {
      callbacks.onGatewayQuote?.(symbolId, quote);
    });
  };

  // private onGatewayTrade = (symbolId: string, trade: GatewayTrade[]) => {
  //   // this.logger.info(`onMarketTrade symbolId: ${symbolId}`, trade);
  //   // this.metrics.inc("px_market_gateway_trade_total", { symbolId });

  //   this.markAlive(symbolId);

  //   this.symbolSubs.values(symbolId).forEach((callbacks) => {
  //     callbacks.onGatewayTrade?.(symbolId, trade);
  //   });
  // };

  // private onGatewayDepth = (symbolId: string, depth: GatewayDepth[]) => {
  //   // this.logger.info("onMarketDepth symbolId: ${symbolId} depth", depth);

  //   this.symbolSubs.values(symbolId).forEach((callbacks) => {
  //     callbacks.onGatewayDepth?.(symbolId, depth);
  //   });
  // };
}

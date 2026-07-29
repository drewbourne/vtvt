# fbt/vtvt

This project is a trading platform for use by a single trader with multiple across, across multiple brokers.

## Architecture Concepts

- Domain driven design (DDD)
- Event-driven architecture
- Contract-driven architecture
- Messaging patterns (Pub/Sub, Req/Rep)
- Ports and adapters

## Architecture Constraints

- NATS will be used a message broker
- Protobuf and Buf.build will be used for message definitions and service interfaces
- TypeScript will be the preferred implementation language
- Node.js will be the preferred implementation runtime
- Every domain service will run independently and communicate exclusively via NATS subjects
- Each domain service may connect to QuestDB for data persistence
- Each domain service may connect to Redis for caching

See additional details on these constraints below.

## Architecture

- Runtime

  - Config
  - Secrets

- Domain services

  - Accounts
  - Market
  - Trading
  - Strategy
  - Watchlist

- Infra services
  - NATS
  - QuestDB
  - Redis
  - Logging
  - Tracing
  - Metrics

## Services, Operations, Clients

See [Services & Operations](./Services%20&%20Operations.md)

## NATS

### NATS Subjects

- `fbt.<domain>.rpc.<operation>`
- `fbt.event.<domain>.(<service>.)?<event>`
- `fbt.hb.<domain>.(<service>.)?`
- `fbt.<domain>.status

## Accounts

- NATS subjects
  - Accounts
    - `fbt.accounts.rpc.list_accounts`
    - `fbt.accounts.rpc.get_account`
    - `fbt.events.accounts.account_added`
    - `fbt.events.accounts.account_updated`
    - `fbt.events.accounts.account_removed`
  - Brokers
    - `fbt.accounts.rpc.list_brokers`
    - `fbt.accounts.rpc.get_broker`
    - `fbt.events.accounts.brokers_added`
    - `fbt.events.accounts.brokers_updated`
    - `fbt.events.accounts.brokers_removed`
- QuestDB tables
  - `accounts`
    - `id`: symbol
    - `name`: string
    - `broker_id`: symbol
    - `apiKey`: string
  - `brokers`
    - `id`: symbol
    - `name`: string
    - `status`: string `enabled` | `disabled`
- Operations
  - `list_accounts`
  - `get_account`
- Clients
  - `AccountsClient`
- Services
  - `AccountsService`
- Ports
- Adapters

## Market

- NATS subjects
  - Instruments
    - `fbt.market.rpc.list_instruments`
    - `fbt.market.rpc.get_instrument`
    - `fbt.market.rpc.subscribe_instrument`
  - Quotes
    - `fbt.market.rpc.subscribe_instrument_quotes`
    - `fbt.events.market.quote`
  - Trades
    - `fbt.market.rpc.subscribe_instrument_trades`
    - `fbt.events.market.trade`
  - Health
    - `fbt.events.market.health`
- QuestDB tables
  - `instruments`: Instrument
  - `quotes`: Quote
  - `trades`: Trade
- Redis
- Services
  - MarketService
- Ports
  - MarketInstrumentsPort
  - MarketQuotesPort
  - MarketTradesPort
- Adapters
  - PXMarketInstrumentAdapter
  - PXMarketQuoteAdapter
  - PXMarketTradeAdapter
  - PXMarketHubConnection

## Trading

- NATS subjects
  - Orders
    - `fbt.trading.rpc.list_orders`
    - `fbt.trading.event.order_updated`
    - `fbt.trading.event.order_placed`
    - `fbt.trading.event.order_opened`
    - `fbt.trading.event.order_filled`
    - `fbt.trading.event.order_closed`
    - `fbt.trading.event.order_rejected`
    - `fbt.trading.event.order_cancelled`
  - Positions
    - `fbt.trading.rpc.list_positions`
    - `fbt.trading.event.position_updated`
    - `fbt.trading.event.position_opened`
    - `fbt.trading.event.position_closed`
  - Trades
    - `fbt.trading.rpc.list_trades`
    - `fbt.trading.event.trade_added`
- QuestDB tables
  - `orders`: Order
  - `positions`: Postion
  - `trades`: Trade
- Redis
- Services
  - TradingService
- Ports
  - TradingPort
- Adapters
  - PXTradingAdapter
  - PXTradingHubConnection

## Strategy

- NATS subjects
  - Strategy
    - `fbt.strategy.rpc.list_strategies`
    - `fbt.strategy.rpc.add_strategy`
    - `fbt.strategy.rpc.update_strategy`
    - `fbt.strategy.rpc.remove_strategy`
    - `fbt.strategy.rpc.start_strategy`
    - `fbt.strategy.rpc.stop_strategy`
    - `fbt.strategy.event.strategy_added`
    - `fbt.strategy.event.strategy_updated`
    - `fbt.strategy.event.strategy_removed`
    - `fbt.strategy.event.strategy_started`
    - `fbt.strategy.event.strategy_stopped`
  - Signals
    - `fbt.strategy.event.signal_enter`
    - `fbt.strategy.event.signal_exit`
    - `fbt.strategy.event.signal_flatten`
    - `fbt.strategy.event.signal_scale_in`
    - `fbt.strategy.event.signal_scale_out`
  - QuestDB tables
    - `strategy_models`
      - `id`: symbol
      - `name`: string
      - `model`: string
      - `parameters`: string
    - `strategy_runners`
      - `id`: symbol
      - `name`: string
      - `model`: string
      - `broker`: symbol
      - `instrument`: symbol
      - `parameters`: string
      - `version`: int
    - `strategy_results`
      - `id`: symbol
      - `strategy_runner_id`: symbol
      - `strategy_runner_version`: int
      - `start_date`
      - `end_date`
      - ...StrategyMetrics
  - Redis
  - Services
    - StrategyModelService
    - StrategyRunnerService
  - Ports
  - Adapters

## System

- NATS subjects
  - `fbt.system.event.session_starting`
  - `fbt.system.event.session_started`
  - `fbt.system.event.service_started`
  - `fbt.system.event.service_stopping`
  - `fbt.system.event.service_stopped`
  - `fbt.system.event.service_stopping`
  - `fbt.system.event.service_stopped`
- QuestDB tables
  - `system_sessions`
- Services
  - SystemRuntimeService
  - SystemSessionService
  - SystemMetricsService
  - SystemHealthService
- Ports
- Adapters

## Watchlist

- NATS subjects
  - `fbt.watchlist.rpc.get_watchlists`
  - `fbt.watchlist.rpc.add_watchlist`
  - `fbt.watchlist.rpc.update_watchlist`
  - `fbt.watchlist.rpc.remove_watchlist`
  - `fbt.watchlist.rpc.add_instrument_to_watchlist`
  - `fbt.watchlist.rpc.remove_instrument_from_watchlist`
  - `fbt.watchlist.event.watchlist_added`
  - `fbt.watchlist.event.watchlist_updated`
  - `fbt.watchlist.event.watchlist_removed`
  - `fbt.watchlist.event.watchlist_instrument_added`
  - `fbt.watchlist.event.watchlist_instrument_removed`
- QuestDB tables
  - `watchlist`
    - `id`: symbol
    - `user_id`: symbol
    - `name`: string
  - `watchlist_instruments`
    - `id`: symbol
    - `broker_id`: symbol
    - `broker_instrument_id`: symboll
    - `idx`: int
- Redis
- Services
  - WatchlistService
- Ports
- Adapters

# Repo Structure

```
apps/
  accounts/
    src/
      accounts.module.ts
      accounts.worker.ts
  market/
    src/
      market.module.ts
      market.worker.ts
  trading/
    src/
      trading.module.ts
      trading.worker.ts
  system/
    src/
      system.module.ts
      system.worker.ts
  strategy/
    src/
      strategy.module.ts
      strategy.worker.ts
  watchlist/
    src/
      watchlist.module.ts
      watchlist.worker.ts
  web/
    src/
      api/
      app/
        accounts/
        brokers/
        chart/
        market/
          instruments/
        trading/
          orders/
          positions/
          trades/
        watchlist/

domains/
  accounts/
    src/
      events/
      models/
      clients/
      services/
  market/
    src/
      events/
      models/
      clients/
      services/
  trading/
    src/
      events/
      models/
      clients/
      services/
  strategy/
    src/
      events/
      models/
      clients/
      services/
  system/
    src/
      events/
      models/
      clients/
      services/
  watchlist/
    src/
      events/
      models/
      clients/
      services/

infra/
  analytics/
    src/
      adapters/
      services/
  nats/
    src/
      services/
  metrics/
    src/
      adapters/
      services/
  quest/
    src/
      adapters/
      services/
  redis/
    src/
      adapters/
      services/
  tracing/
    src/
      adapters/
      services/
```

## System Lifecycle

- read config
- read secrets
- connect to nats
- connect to quest, as needed
- connect to redis, as needed

## Service Lifecycle

- read config
- read secrets
- connect to nats
- connect to quest, as needed
- connect to redis, as needed

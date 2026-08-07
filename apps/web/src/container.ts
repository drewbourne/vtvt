import { NatsService } from "@fbt/nats";
import { registerNats } from "@fbt/nats/awilix";
import { Logger } from "@logtape/logtape";
import {
  asClass,
  asValue,
  createContainer,
  InferCradleFromContainer,
  InjectionMode,
} from "awilix";
import { registerLogger, injectLogger } from "@fbt/logging/awilix";
import { AccountsServiceClient } from "@fbt/accounts";
import { WatchlistServiceClient } from "@fbt/watchlist";
import { InstrumentsServiceClient, LivePricesServiceClient } from "@fbt/market";
import { registerOtel } from "@fbt/otel/awilix";
import { OtelService } from "@fbt/otel";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const webContainer = container.register({
  service: asValue(process.env.npm_package_name ?? "unknown"),
  version: asValue(process.env.npm_package_version ?? "0.0.1"),

  accountsClient: asClass(AccountsServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "accounts" }),
  }),
  instrumentsClient: asClass(InstrumentsServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "instruments" }),
  }),
  livePricesClient: asClass(LivePricesServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "livePrices" }),
  }),
  watchlistClient: asClass(WatchlistServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "watchlists" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
  ...registerNats(),
});

export type WebCradle = InferCradleFromContainer<typeof webContainer>;

import { registerNats } from "@fbt/nats/awilix";
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
import { trace } from "@opentelemetry/api";
import { registerOtel } from "@fbt/otel/awilix";
import { ServicesClient } from "./features/services/ServicesClient";

const service = process.env.npm_package_name ?? "unknown";
const version = process.env.npm_package_version ?? "0.0.1";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const appContainer = container.register({
  service: asValue(service),
  version: asValue(version),

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
  servicesClient: asClass(ServicesClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "services" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
  ...registerNats(),
  tracer: asValue(trace.getTracer(service)),
});

export type AppCradle = InferCradleFromContainer<typeof appContainer>;

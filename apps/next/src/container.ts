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
import { InstrumentsServiceClient } from "@fbt/market";
import { trace } from "@opentelemetry/api";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const appContainer = container.register({
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
  watchlistClient: asClass(WatchlistServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "watchlists" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerNats(),
  tracer: asValue(trace.getTracer("@fbt/next")),
});

export type AppCradle = InferCradleFromContainer<typeof appContainer>;

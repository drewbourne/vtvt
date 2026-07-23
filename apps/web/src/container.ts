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
import { InstrumentsServiceClient } from "@fbt/market";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const webContainer = container.register({
  service: asValue("@fbt/web"),
  version: asValue("0.0.1"),

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
});

export type WebCradle = InferCradleFromContainer<typeof webContainer>;

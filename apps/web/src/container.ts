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

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const webContainer = container.register({
  service: asValue("@fbt/web"),
  version: asValue("0.0.1"),

  // dependencies
  ...registerLogger(),
  ...registerNats(),
  accountsClient: asClass(AccountsServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "accountsClient" }),
  }),
  watchlistClient: asClass(WatchlistServiceClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "watchlistClient" }),
  }),
});

export type WebCradle = InferCradleFromContainer<typeof webContainer>;

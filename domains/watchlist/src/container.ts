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
import { WatchlistService } from "./service.js";
import { WatchlistServiceWorker } from "./worker.js";
import { registerLogger, injectLogger } from "@fbt/logging/awilix";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const watchlistContainer = container.register({
  service: asValue("@fbt/watchlist"),
  version: asValue("0.0.1"),
  watchlistService: asClass(WatchlistService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "watchlist" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerNats(),
});

export type WatchlistCradle = InferCradleFromContainer<
  typeof watchlistContainer
>;

export const watchlistWorkerContainer = watchlistContainer
  .createScope()
  .register({
    watchlistWorker: asClass(WatchlistServiceWorker, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "worker" }),
    }),
  });

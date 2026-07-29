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
import { registerQuest } from "@fbt/quest/awilix";
import { registerRedis } from "@fbt/redis/awilix";
import { RedisService } from "@fbt/redis";
import { registerOtel } from "@fbt/otel/awilix";
import { OtelService } from "@fbt/otel";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const watchlistContainer = container.register({
  service: asValue(process.env.npm_package_name ?? "unknown"),
  version: asValue(process.env.npm_package_version ?? "0.0.1"),
  watchlistService: asClass(WatchlistService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "watchlist" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
  ...registerNats(),
  ...registerQuest(),
  ...registerRedis(),
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

import { NatsService } from "@fbt/nats";
import { registerNats } from "@fbt/nats/awilix";
import { Logger } from "@logtape/logtape";
import {
  asClass,
  asValue,
  AwilixContainer,
  createContainer,
  InferCradleFromContainer,
  InjectionMode,
} from "awilix";
import { SystemService } from "./services/SystemService.js";
import { SystemServiceWorker } from "./services/SystemServiceWorker.js";
import { registerLogger, injectLogger } from "@fbt/logging/awilix";
import { registerQuest } from "@fbt/quest/awilix";
import { registerRedis } from "@fbt/redis/awilix";
import { QuestService } from "@fbt/quest";
import { RedisService } from "@fbt/redis";
import { registerOtel } from "@fbt/otel/awilix";
import { OtelService } from "@fbt/otel";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const systemContainer = container.register({
  service: asValue(process.env.npm_package_name ?? "unknown"),
  version: asValue(process.env.npm_package_version ?? "0.0.1"),

  systemService: asClass(SystemService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "system" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
  ...registerNats(),
  ...registerQuest(),
  ...registerRedis(),
});

export type SystemCradle = InferCradleFromContainer<typeof systemContainer>;

export const systemWorkerContainer = systemContainer.createScope().register({
  systemWorker: asClass(SystemServiceWorker, {
    injectionMode: InjectionMode.CLASSIC,
    // injector: injectLogger({ name: "worker" }),
    injector: (container: AwilixContainer<object>) => ({
      ...injectLogger({ name: "worker" })(container),
      container,
    }),
  }),
});

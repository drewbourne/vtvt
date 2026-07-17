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
import { MarketWorker } from "./worker.js";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const marketContainer = container.register({
  service: asValue("@fbt/market"),
  version: asValue("0.0.1"),

  // dependencies
  ...registerLogger(),
  ...registerNats(),
});

export type MarketCradle = InferCradleFromContainer<typeof marketContainer>;

export const marketWorkerContainer = marketContainer.createScope().register({
  marketWorker: asClass(MarketWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "worker" }),
  }),
});

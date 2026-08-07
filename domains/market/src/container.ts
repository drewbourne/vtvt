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
import { InstrumentsService } from "./instruments/services/InstrumentsService.js";
import { InstrumentsServiceWorker } from "./instruments/services/InstrumentsServiceWorker.js";
import { registerOtel } from "@fbt/otel/awilix";
import { OtelService } from "@fbt/otel";
import { LivePricesService } from "./live/services/LivePricesService.js";
import { LivePriceServiceWorker } from "./live/services/LivePricesServiceWorker.js";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const marketContainer = container.register({
  service: asValue(process.env.npm_package_name ?? "unknown"),
  version: asValue(process.env.npm_package_version ?? "0.0.1"),

  instrumentsService: asClass(InstrumentsService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "instruments" }),
  }),
  livePricesService: asClass(LivePricesService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "livePrices" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
  ...registerNats(),
});

export type MarketCradle = InferCradleFromContainer<typeof marketContainer>;

export const marketWorkerContainer = marketContainer.createScope().register({
  marketWorker: asClass(MarketWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "marketWorker" }),
  }),
  instrumentsWorker: asClass(InstrumentsServiceWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "instrumentsWorker" }),
  }),
  livePricesWorker: asClass(LivePriceServiceWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "livePricesWorker" }),
  }),
});

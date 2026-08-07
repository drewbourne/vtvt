import { registerNats } from "@fbt/nats/awilix";
import { registerRedis } from "@fbt/redis/awilix";
import { Logger } from "@logtape/logtape";
import {
  asClass,
  asValue,
  createContainer,
  InferCradleFromContainer,
  InjectionMode,
} from "awilix";
import { registerLogger, injectLogger } from "@fbt/logging/awilix";
import { TopstepAccountsServiceWorker } from "./accounts/services/TopstepAccountsServiceWorker.js";
import { TopstepCredentials } from "./auth/models/TopstepCredentials.js";
import { TopstepAuthService } from "./auth/services/TopstepAuthService.js";
import { TopstepAccountsService } from "./accounts/services/TopstepAccountsService.js";
import { TopstepInstrumentsServiceWorker } from "./instruments/services/TopstepInstrumentsServiceWorker.js";
import { TopstepInstrumentsService } from "./instruments/services/TopstepInstrumentsService.js";
import { registerOtel } from "@fbt/otel/awilix";
import { OtelService } from "@fbt/otel";
import { TopstepMarketHubClient } from "./market/services/TopstepMarketHubClient.js";
import { TopstepLivePricesService } from "./market/services/TopstepLivePricesService.js";
import { TopstepLivePricesServiceWorker } from "./market/services/TopstepLivePricesServiceWorker.js";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const topstepContainer = container.register({
  service: asValue(process.env.npm_package_name ?? "unknown"),
  version: asValue(process.env.npm_package_version ?? "0.0.1"),

  // secrets
  credentials: asValue(
    TopstepCredentials.parse({
      username: process.env.TOPSTEPX_USER_NAME,
      apiKey: process.env.TOPSTEPX_API_KEY,
    }),
  ),

  // services
  authService: asClass(TopstepAuthService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "auth" }),
  }),
  accountsService: asClass(TopstepAccountsService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "accounts" }),
  }),
  instrumentsService: asClass(TopstepInstrumentsService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "instruments" }),
  }),
  livePricesService: asClass(TopstepLivePricesService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "livePricesService" }),
  }),
  marketHub: asClass(TopstepMarketHubClient, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "marketHub" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
  ...registerNats(),
  ...registerRedis(),
});

export type TopstepCradle = InferCradleFromContainer<typeof topstepContainer>;

export const topstepWorkerContainer = topstepContainer.createScope().register({
  accountsWorker: asClass(TopstepAccountsServiceWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "accountsWorker" }),
  }),
  instrumentsWorker: asClass(TopstepInstrumentsServiceWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "instrumentsWorker" }),
  }),
  livePricesWorker: asClass(TopstepLivePricesServiceWorker, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "livePricesWorker" }),
  }),
});

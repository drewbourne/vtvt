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

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const topstepContainer = container.register({
  service: asValue("@fbt/topstep"),
  version: asValue("0.0.1"),

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

  // dependencies
  ...registerLogger(),
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
});

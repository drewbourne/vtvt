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
import { AccountsService } from "./service.js";
import { AccountsServiceWorker } from "./worker.js";
import { registerLogger, injectLogger } from "@fbt/logging/awilix";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const accountsContainer = container.register({
  service: asValue("@fbt/accounts"),
  version: asValue("0.0.1"),
  accountsService: asClass(AccountsService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "accounts" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerNats(),
});

export type AccountsCradle = InferCradleFromContainer<typeof accountsContainer>;

export const accountsWorkerContainer = accountsContainer
  .createScope()
  .register({
    accountsWorker: asClass(AccountsServiceWorker, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "worker" }),
    }),
  });

import { registerNats } from "@fbt/nats/awilix";
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
import { registerOtel } from "@fbt/otel/awilix";
import { OtelService } from "@fbt/otel";

const service = process.env.npm_package_name ?? "unknown";
const version = process.env.npm_package_version ?? "0.0.1";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

export const accountsContainer = container.register({
  service: asValue(service),
  version: asValue(version),

  accountsService: asClass(AccountsService, {
    injectionMode: InjectionMode.CLASSIC,
    injector: injectLogger({ name: "accounts" }),
  }),

  // dependencies
  ...registerLogger(),
  ...registerOtel(),
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

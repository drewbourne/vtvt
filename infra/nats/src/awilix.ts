import { asClass, InjectionMode } from "awilix";
import { NatsService } from "./services/NatsService.js";
import { injectLogger } from "@fbt/logging/awilix";

export function registerNats() {
  return {
    nats: asClass(NatsService, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "nats" }),
    }),
  };
}

import { asClass, asFunction, InjectionMode } from "awilix";
import { NatsService } from "./services/NatsService.js";
import { injectLogger } from "@fbt/logging/awilix";
import { connect, ConnectionOptions, NatsConnection } from "nats";
import { NatsTracer } from "./services/NatsTracer.js";
import { NatsClient } from "./services/NatsClient.js";
import { NatsServiceWorker } from "./services/NatsServiceWorker.js";

// FIXME pass in natsConnectionOptions
export function registerNats() {
  return {
    natsConnectionOptions: asFunction(({ service, version }) => {
      const config: ConnectionOptions = {
        name: `${service}@${version}`,
        pedantic: process.env.NODE_ENV === "development",
        reconnect: true,
        maxReconnectAttempts: 10,
        // servers:
      };
      return config;
    }).singleton(),
    natsConnection: asFunction(({ natsConnectionOptions }) => {
      return new Promise(async (resolve) => {
        const nc = await connect(natsConnectionOptions);
        resolve(nc);
      });
    }).singleton(),
    // Depends on tracer provided by @smarterdx/otel registerOtel()
    natsTracer: asClass(NatsTracer, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "natsTracer" }),
    }),
    natsClient: asClass(NatsClient, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "natsClient" }),
    }),
    natsServiceWorker: asClass(NatsServiceWorker, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "natsServiceWorker" }),
    }),
    // @deprecated use NatsClient
    nats: asClass(NatsService, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "nats" }),
    }),
  };
}

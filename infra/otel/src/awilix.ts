import { asClass, asFunction, InjectionMode } from "awilix";
import { OtelService } from "./services/OtelService.js";
import { injectLogger } from "@fbt/logging/awilix";

export function registerOtel() {
  return {
    otel: asClass(OtelService, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "otel" }),
    }),
    meter: asFunction(({ otel }: { otel: OtelService }) => otel.getMeter()),
    tracer: asFunction(({ otel }: { otel: OtelService }) => otel.getTracer()),
  };
}

import { asClass, asValue, InjectionMode } from "awilix";
import { RedisService } from "./services/RedisService.js";
import { injectLogger } from "@fbt/logging/awilix";
import { RedisConfig } from "./models/RedisConfig.js";

export function registerRedis() {
  return {
    redis: asClass(RedisService, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "redis" }),
    }),
    redisConfig: asValue(RedisConfig.parse({})),
  };
}

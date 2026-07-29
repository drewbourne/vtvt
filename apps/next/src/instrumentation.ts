import { configureLogging } from "@fbt/logging";
import { registerOTel } from "@vercel/otel";
import { appContainer } from "./container";

export function register() {
  const { service } = appContainer.cradle;

  configureLogging({ service });

  registerOTel({ serviceName: service });
}

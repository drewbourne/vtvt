import { getLogger, Logger } from "@logtape/logtape";
import { asFunction, AwilixContainer } from "awilix";

export function registerLogger() {
  return {
    loggerCategory: asFunction(({ service, version }) => [service]),
    loggerBase: asFunction(({ loggerCategory }) => getLogger(loggerCategory)),
    loggerFactory: asFunction<Logger["getChild"]>(({ loggerBase }) => {
      return loggerBase.getChild.bind(loggerBase);
    }),
  };
}

export function injectLogger<T>({ name }: { name: string }) {
  return (container: AwilixContainer<object>) => ({
    logger: container.resolve<Logger>("loggerBase").getChild(name),
  });
}

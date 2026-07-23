import { asClass, asValue, InjectionMode } from "awilix";
import { QuestService } from "./services/QuestService.js";
import { injectLogger } from "@fbt/logging/awilix";
import { QuestConfig } from "./models/QuestConfig.js";

export function registerQuest() {
  return {
    quest: asClass(QuestService, {
      injectionMode: InjectionMode.CLASSIC,
      injector: injectLogger({ name: "quest" }),
    }),
    questConfig: asValue(
      QuestConfig.parse({
        host: process.env.QUEST_HOST ?? "localhost",
        port: process.env.QUEST_PORT ?? 8812,
        user: process.env.QUEST_USER ?? "admin",
        pass: process.env.QUEST_PASS ?? "quest",
        database: process.env.QUEST_DATABASE ?? "vtvt",
        senderPort: process.env.QUEST_SENDER_PORT ?? 9000,
      }),
    ),
  };
}

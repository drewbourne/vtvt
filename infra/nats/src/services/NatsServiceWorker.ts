import { Logger } from "@logtape/logtape";
import { NatsService } from "./NatsService.js";
import { ServiceOperation } from "@fbt/service";

export class NatsServiceWorker {
  constructor(
    protected service: string,
    protected version: string,
    protected logger: Logger,
    protected nats: NatsService,
  ) {}
}

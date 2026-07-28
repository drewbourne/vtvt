import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";

const operations = [];

const events = [];

export class SystemServiceWorker {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async start() {
    this.logger.debug("start");

    // this.subscribeOperations();

    this.scheduleEvents();
  }

  //   async subscribeOperations() {}

  async scheduleEvents() {
    setInterval(this.tick.bind(this), 1_000);
  }

  async tick() {
    // this.nats.publishEvent(eventDef, {});

    this.nats.publish(
      "fbt.system.event.tick",
      JSON.stringify({
        time: new Date().toISOString(),
      }),
    );
  }
}

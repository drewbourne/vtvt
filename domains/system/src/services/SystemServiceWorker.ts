import { NatsServiceWorker } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { SystemService } from "./SystemService.js";
import { ListServicesOperation } from "../operations/ListServicesOperation.js";

export class SystemServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private systemService: SystemService,
  ) {}

  async start() {
    this.logger.debug("start");

    await this.natsServiceWorker.addService(
      {
        name: "fbt.system",
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: {},
      },
      [
        this.natsServiceWorker.handler(
          ListServicesOperation,
          {},
          async ({ params }) => {
            return await this.systemService.listServices(params);
          },
        ),
      ],
    );
  }
}

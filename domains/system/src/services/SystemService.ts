import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import {
  ListServicesRequest,
  ListServicesResult,
} from "../operations/ListServicesOperation.js";

export class SystemService {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async listServices(
    request: ListServicesRequest,
  ): Promise<ListServicesResult> {
    const nc = await this.nats.connect();
    const sc = nc.services.client();

    const services = [];

    const iter = await (request?.name ? sc.info(request.name) : sc.info());

    for await (const i of iter) {
      services.push(i);
    }

    this.logger.debug("listServices", { services });

    return { status: "success", services };
  }
}

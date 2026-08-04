import { NatsServiceWorker } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import { ListAccountsForBrokerOperation } from "@fbt/accounts/operations";
import { TopstepAccountsService } from "./TopstepAccountsService.js";

export class TopstepAccountsServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private accountsService: TopstepAccountsService,
  ) {}

  async start() {
    this.logger.info("start");

    await this.natsServiceWorker.addService(
      {
        name: `fbt.accounts`,
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: { serviceLevel: "1" },
      },
      [
        this.natsServiceWorker.handler(
          ListAccountsForBrokerOperation,
          { operationLevel: "2" },
          async ({ params }) => {
            return this.accountsService.listAccountsForBroker(params);
          },
        ),
      ],
    );
  }
}

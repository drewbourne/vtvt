import { NatsServiceWorker } from "@fbt/nats";
import { AccountsService } from "./AccountsService.js";
import { Logger } from "@logtape/logtape";
import { ListAccountsOperation } from "../operations/ListAccountsOperation.js";

export class AccountsServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private natsServiceWorker: NatsServiceWorker,
    private accountsService: AccountsService,
  ) {}

  async start() {
    this.logger.debug("start");

    await this.natsServiceWorker.addService(
      {
        name: `FBT_ACCOUNTS`,
        version: this.version,
        description: `${this.service} v${this.version}`,
        metadata: { serviceLevel: "1" },
      },
      [
        this.natsServiceWorker.handler(
          ListAccountsOperation,
          { operationLevel: "2" },
          async ({ params }) => {
            return this.accountsService.listAccounts(params);
          },
        ),
      ],
    );
  }
}

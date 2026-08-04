import { NatsServiceWorker } from "@fbt/nats";
import { AccountsService } from "./AccountsService.js";
import { Logger } from "@logtape/logtape";
import { ListAccountsOperation } from "../operations/ListAccountsOperation.js";

export class AccountsServiceWorker {
  constructor(
    private logger: Logger,
    private service: string,
    private version: string,
    private accountsService: AccountsService,
    private natsServiceWorker: NatsServiceWorker,
  ) {}

  async start() {
    this.logger.debug("start");

    await this.natsServiceWorker.addService(
      {
        name: `fbt.accounts`,
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

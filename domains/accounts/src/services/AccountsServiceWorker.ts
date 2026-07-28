import { NatsService } from "@fbt/nats";
import { AccountsService } from "./AccountsService.js";
import { Logger } from "@logtape/logtape";
import { ListAccountsOperation } from "../operations/ListAccountsOperation.js";

const operations = [
  // service operations
  ListAccountsOperation,

  // introspection
  // - methodz
  // observability
  // - healthz
  // - metricz
];

export class AccountsServiceWorker {
  constructor(
    private accountsService: AccountsService,
    private nats: NatsService,
    private logger: Logger,
  ) {}

  async start() {
    this.logger.debug("start");

    this.subscribeOperations();
  }

  async subscribeOperations() {
    this.logger.debug("subscribeOperations", {
      operations: operations.map((o) => `${o.subject} -> ${o.method}`),
    });

    const nc = await this.nats.connect();

    // const svc = await nc.services.add({
    //   name: process.env.npm_package_name!,
    //   version: process.env.npm_package_version!,
    //   description: "Accounts service",
    // });

    // svc.stopped.then((error) => {
    //   this.logger.error(`svc.stopped`, { error });
    // });

    // const root = svc.addGroup("fbt.accounts.rpc");

    for await (const operation of operations) {
      // root.addEndpoint(operation.method, {
      //   metadata: {
      //     // description: "",
      //     // paramaSchema: ...
      //     // resultSchema: ...
      //   },
      //   handler: (err, msg) => {
      //     if (err) {
      //       svc.stop(err).finally(() => {});
      //     }
      //   },
      // });

      this.nats.subscribeOperation(
        operation,
        {},
        // @ts-expect-error
        async (request) => {
          // @ts-expect-error
          return this.accountsService[operation.method](request);
        },
      );
    }
  }
}

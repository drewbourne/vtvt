import { Logger } from "@logtape/logtape";
import {
  ListAccountsRequest,
  ListAccountsResult,
} from "../operations/ListAccountsOperation.js";
import { NatsService } from "@fbt/nats";
import { ListAccountsForBrokerOperation } from "../operations/ListAccountsForBrokerOperation.js";

export class AccountsService {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async listAccounts(
    request: ListAccountsRequest,
  ): Promise<ListAccountsResult> {
    // this.logger.debug('listAccounts', { request })

    const responses = await this.nats.requestManyOperation(
      request,
      ListAccountsForBrokerOperation,
      {
        strategy: "count",
        // FIXME should based on the number of registered brokers
        maxMessages: 1,
        maxWait: 5_000,
      },
    );

    const items = responses.flatMap((r) => r.items);

    const result = {
      count: items.length,
      total: items.length,
      items,
    };

    this.logger.debug("listAccounts", {
      request,
      responses: responses.length,
      items: items.length,
    });

    return result;
  }
}

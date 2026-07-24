import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import {
  ListAccountsOperation,
  ListAccountsRequest,
  ListAccountsResult,
} from "../operations/ListAccountsOperation.js";

export class AccountsServiceClient {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async listAccounts(
    request: ListAccountsRequest,
  ): Promise<ListAccountsResult> {
    const result = await this.nats.requestOperation(
      request,
      ListAccountsOperation,
    );

    this.logger.debug("listAccounts", { request, result });

    return result;
  }
}

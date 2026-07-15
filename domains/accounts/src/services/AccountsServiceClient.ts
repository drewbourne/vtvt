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
    const data = ListAccountsRequest.parse(request);
    const msg = JSON.stringify(data);
    const res = await this.nats.request(ListAccountsOperation.subject, msg);
    const result = ListAccountsResult.parse(res.json());

    this.logger.info("listAccounts", { request, result });
    return result;
  }
}

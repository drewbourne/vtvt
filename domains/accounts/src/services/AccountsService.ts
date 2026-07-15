import { Logger } from "@logtape/logtape";
import {
  ListAccountsRequest,
  ListAccountsResult,
} from "../operations/ListAccountsOperation.js";

export class AccountsService {
  constructor(private logger: Logger) {}

  async listAccounts(
    request: ListAccountsRequest,
  ): Promise<ListAccountsResult> {
    const result = {
      count: 0,
      total: 0,
      items: [],
    };

    this.logger.info("listAccounts", {
      request,
      result,
    });

    return result;
  }
}

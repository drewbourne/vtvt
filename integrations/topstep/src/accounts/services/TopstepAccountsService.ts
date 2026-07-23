import { BrokerId } from "@fbt/accounts/models";
import {
  ListAccountsForBrokerRequest,
  ListAccountsForBrokerResult,
} from "@fbt/accounts/operations";
import { Logger } from "@logtape/logtape";
import { TopstepAuthService } from "../../auth/services/TopstepAuthService.js";
import { client } from "@fbt/topstepx-api/gateway-client";
import { accountSearchAccounts } from "@fbt/topstepx-api/gateway";
import { toAccount } from "../transforms/toAccount.js";
import { TopstepBrokerId } from "../../models/TopstepBrokerId.js";

export class TopstepAccountsService {
  constructor(
    private logger: Logger,
    private authService: TopstepAuthService,
  ) {}

  async listAccountsForBroker(
    request: ListAccountsForBrokerRequest,
  ): Promise<ListAccountsForBrokerResult> {
    this.logger.debug("listAccountsForBroker", request);

    const token = await this.authService.getToken();

    try {
      const result = await accountSearchAccounts({
        client,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          onlyActiveAccounts: true,
        },
      });

      if (result.data?.success) {
        const count = result.data.accounts?.length ?? 0;
        const items = result.data.accounts!.map(toAccount);

        this.logger.debug(`listAccountsForBrokers success`, { request });

        return {
          count,
          items,
          broker: TopstepBrokerId,
        };
      }

      throw new Error("accountSearchAccounts failure", {
        cause: result.error,
      });
    } catch (error) {
      this.logger.error(`listAccountsForBrokers error`, { request, error });
      this.logger.error(error as Error);

      throw error;
    }
  }
}

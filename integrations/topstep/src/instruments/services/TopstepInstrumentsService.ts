import { Logger } from "@logtape/logtape";
import { TopstepAuthService } from "../../auth/services/TopstepAuthService.js";
import {
  ListInstrumentsForBrokerRequest,
  ListInstrumentsForBrokerResult,
} from "@fbt/market/operations";
import { client } from "@fbt/topstepx-api/gateway-client";
import { contractAvailableContracts } from "@fbt/topstepx-api/gateway";
import { BrokerId } from "@fbt/accounts/models";
import { TopstepBrokerId } from "../../models/TopstepBrokerId.js";
import { contractToInstrument } from "../transforms/contractToInstrument.js";

export class TopstepInstrumentsService {
  constructor(
    private logger: Logger,
    private authService: TopstepAuthService,
  ) {}

  async listInstrumentsForBroker(
    request: ListInstrumentsForBrokerRequest,
  ): Promise<ListInstrumentsForBrokerResult> {
    this.logger.debug("listAccountsForBroker", request);

    const token = await this.authService.getToken();

    try {
      const result = await contractAvailableContracts({
        client,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          live: request.environment === "live" ? true : false,
        },
      });

      this.logger.debug("listInstrumentsForBroker contractAvailableContracts", {
        result,
      });

      if (result.data?.success) {
        const count = result.data.contracts?.length ?? 0;
        const items = result.data.contracts!.map((contract) => {
          return contractToInstrument(contract, request.environment);
        });

        return {
          status: "success",
          count,
          items,
          broker: TopstepBrokerId,
        };
      }

      throw new Error("accountSearchAccounts failure", {
        cause: result.error,
      });
    } catch (error) {
      this.logger.error(`listInstrumentsForBroker error`, { request, error });
      this.logger.error(error as Error);

      throw error;
    }
  }
}

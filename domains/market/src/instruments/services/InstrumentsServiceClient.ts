import { NatsService } from "@fbt/nats";
import { Logger } from "@logtape/logtape";
import {
  ListInstrumentsOperation,
  ListInstrumentsRequest,
  ListInstrumentsResult,
} from "../operations/ListInstrumentsOperation.js";
import {
  GetInstrumentForSymbolOperation,
  GetInstrumentForSymbolRequest,
  GetInstrumentForSymbolResult,
} from "../operations/GetInstrumentForSymbolOperation.js";
import {
  GetInstrumentRequest,
  GetInstrumentResult,
  GetInstrumentOperation,
} from "../operations/GetInstrumentOperation.js";

export class InstrumentsServiceClient {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async listInstruments(
    request: ListInstrumentsRequest,
  ): Promise<ListInstrumentsResult> {
    const result = await this.nats.requestOperation(
      request,
      ListInstrumentsOperation,
    );

    this.logger.debug("listInstruments", { request, result });

    return result;
  }

  async getInstrument(
    request: GetInstrumentRequest,
  ): Promise<GetInstrumentResult> {
    const result = await this.nats.requestOperation(
      request,
      GetInstrumentOperation,
    );

    this.logger.debug("listInstruments", { request, result });

    return result;
  }

  async getInstrumentForSymbol(
    request: GetInstrumentForSymbolRequest,
  ): Promise<GetInstrumentForSymbolResult> {
    const result = await this.nats.requestOperation(
      request,
      GetInstrumentForSymbolOperation,
    );

    this.logger.debug("listInstruments", { request, result });

    return result;
  }
}

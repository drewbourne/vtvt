import { Logger } from "@logtape/logtape";
import {
  ListInstrumentsRequest,
  ListInstrumentsResult,
} from "../operations/ListInstrumentsOperation.js";
import {
  GetInstrumentRequest,
  GetInstrumentResult,
} from "../operations/GetInstrumentOperation.js";
import {
  GetInstrumentForSymbolRequest,
  GetInstrumentForSymbolResult,
} from "../operations/GetInstrumentForSymbolOperation.js";
import { match } from "ts-pattern";

export class InstrumentService {
  constructor(private logger: Logger) {}

  async listInstruments(
    request: ListInstrumentsRequest,
  ): Promise<ListInstrumentsResult> {
    return { status: "success", count: 0, total: 0, items: [] };
  }

  async getInstrument(
    request: GetInstrumentRequest,
  ): Promise<GetInstrumentResult> {
    const instruments = await this.listInstruments({
      filters: [{ field: "id", op: "eq", value: request.id }],
      sorts: [{ field: "id", sort: "asc", nulls: "last" }],
      limit: 1,
    });

    return match(instruments)
      .with({ status: "success" }, (i) => ({
        status: "success" as const,
        instrument: i.items.at(0)!,
      }))
      .with({ status: "failure" }, (i) => ({
        status: "failure" as const,
        error: i.error,
      }))
      .exhaustive();
  }

  async getInstrumentForSymbol(
    request: GetInstrumentForSymbolRequest,
  ): Promise<GetInstrumentForSymbolResult> {
    const instruments = await this.listInstruments({
      filters: [{ field: "symbol", op: "eq", value: request.symbol }],
      sorts: [{ field: "symbol", sort: "asc", nulls: "last" }],
      limit: 1,
    });

    return match(instruments)
      .with({ status: "success" }, (i) => ({
        status: "success" as const,
        instrument: i.items.at(0)!,
      }))
      .with({ status: "failure" }, (i) => ({
        status: "failure" as const,
        error: i.error,
      }))
      .exhaustive();
  }
}

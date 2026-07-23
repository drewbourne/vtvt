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
import {
  ListInstrumentsForBrokerOperation,
  ListInstrumentsForBrokerRequest,
} from "../operations/ListInstrumentsForBrokerOperation.js";
import { NatsService } from "@fbt/nats";
import { Instrument } from "../models/Instrument.js";

const filterOps = {
  // string
  eq: (v: string, e: string) => v === e,
  includes: (v: string, e: string) => v.includes(e),
  startsWith: (v: string, e: string) => v.startsWith(e),
  endsWith: (v: string, e: string) => v.endsWith(e),
  fuzzy: (v: string, e: string) => false,
  // array
  in: (v: string, e: string[]) => e.includes(v),
  nin: (v: string, e: string[]) => !e.includes(v),
};

export class InstrumentsService {
  constructor(
    private logger: Logger,
    private nats: NatsService,
  ) {}

  async listInstruments(
    request: ListInstrumentsRequest,
  ): Promise<ListInstrumentsResult> {
    const brokerFilter = request.filters?.find((f) => f.field === "brokerId");

    const environmentFilter = request.filters?.find(
      (f) => f.field === "environment",
    );

    const brokerRequest: ListInstrumentsForBrokerRequest = {
      ...(brokerFilter ? { brokers: brokerFilter.value } : {}),
      environment: environmentFilter?.value ?? "sim",
    };

    const responses = await this.nats.requestManyOperation(
      brokerRequest,
      ListInstrumentsForBrokerOperation,
      {
        strategy: "count",
        // FIXME should based on the number of registered brokers
        maxMessages: 1,
        maxWait: 5_000,
      },
    );

    // collate
    let items = responses
      .filter((r) => r.status === "success")
      .flatMap((r) => r.items);

    // apply filters
    if (request.filters) {
      items = items.filter((i) =>
        request.filters.every((f) => {
          const op = filterOps[f.op]!;
          // @ts-expect-error
          return op(i[f.field], f.value);
        }),
      );
    }

    // apply sorts
    if (request.sorts) {
      items = items.toSorted((a, b) => {
        let comp = 0;

        for (const sort of request.sorts) {
          const av = a[sort.field];
          const bv = b[sort.field];
          comp = av < bv ? -1 : av === bv ? 0 : 1;
          if (comp !== 0) break;
        }

        return comp;
      });
    }

    // apply limit
    if (request.limit > 0) {
      items = items.slice(0, request.limit);
    }

    this.logger.debug("listInstruments", {
      request,
      brokerRequest,
      brokerResponses: responses.length,
      items: items.length,
    });

    return { status: "success", count: items.length, items };
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

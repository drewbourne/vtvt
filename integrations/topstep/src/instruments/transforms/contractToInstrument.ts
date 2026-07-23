import { ContractModel } from "@fbt/topstepx-api/gateway";
import {
  BrokerSymbolId,
  Instrument,
  InstrumentId,
  InstrumentType,
  Symbol,
} from "@fbt/market/models";
import { TopstepBrokerId } from "../../models/TopstepBrokerId.js";

export function contractToInstrument(
  contract: ContractModel,
  environment: "live" | "sim",
): Instrument {
  return Instrument.parse({
    id: InstrumentId.parse(`instrument:topstep:${contract.name}`),
    brokerId: TopstepBrokerId,
    brokerSymbolId: BrokerSymbolId.parse(contract.id),
    instrumentType: InstrumentType.parse("future"),
    environment,
    symbol: Symbol.parse(contract.name),
    name: contract.name,
    description: contract.description,
    tickSize: contract.tickSize,
    tickValue: contract.tickValue,
    activeContract: contract.activeContract,
  });
}

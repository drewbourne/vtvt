import { Logger } from "@logtape/logtape";

import os from "os";
import { context, metrics, propagation, trace } from "@opentelemetry/api";
import { AlwaysOnSampler, TracerProvider } from "@opentelemetry/sdk-trace";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";
import { MeterProvider } from "@opentelemetry/sdk-metrics";

export class OtelService {
  constructor(
    private name: string,
    private version: string,
    private logger: Logger,
  ) {
    const contextManager = new AsyncLocalStorageContextManager();
    context.setGlobalContextManager(contextManager);

    const meterProvider = new MeterProvider();
    metrics.setGlobalMeterProvider(meterProvider);

    const propagator = new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    });
    propagation.setGlobalPropagator(propagator);

    const tracerProvider = new TracerProvider({
      sampler: new AlwaysOnSampler(),
    });
    trace.setGlobalTracerProvider(tracerProvider);

    process.on("SIGTERM", async () => {
      await tracerProvider.shutdown().catch(console.error);
      process.exit(128 + os.constants.signals.SIGTERM);
    });
    process.once("beforeExit", async () => {
      await tracerProvider.shutdown().catch(console.error);
    });
  }

  getMeter() {
    return metrics.getMeter(this.name, this.version);
  }

  getTracer() {
    return trace.getTracer(this.name, this.version);
  }
}

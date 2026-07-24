import {
  configure as configureLogtape,
  getConsoleSink,
} from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import { getOpenTelemetrySink, OpenTelemetrySinkOptions } from "@logtape/otel";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-grpc";

export async function configureLogging({
  service,
  otel,
}: {
  service: string;
  otel?: OpenTelemetrySinkOptions;
}) {
  await configureLogtape({
    sinks: {
      console: getConsoleSink({
        formatter: getPrettyFormatter({ properties: true }),
      }),
      otel: getOpenTelemetrySink(
        otel
          ? otel
          : {
              loggerProvider: new LoggerProvider({
                processors: [
                  new SimpleLogRecordProcessor({
                    exporter: new OTLPLogExporter(),
                  }),
                ],
              }),
            },
      ),
    },
    loggers: [
      {
        category: ["logtape", "meta"],
        lowestLevel: "warning",
        sinks: ["console", "otel"],
      },
      {
        category: [service],
        lowestLevel: "debug",
        sinks: ["console", "otel"],
      },
    ],
  });
}

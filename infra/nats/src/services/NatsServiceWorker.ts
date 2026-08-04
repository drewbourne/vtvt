import { Logger } from "@logtape/logtape";
import {
  ServiceDescriptor,
  ServiceMethodName,
  ServiceOperation,
  ServiceRpcSubject,
} from "@fbt/service";
import { NatsClient } from "./NatsClient.js";
import * as z from "zod";
import { Msg, NatsError, Service, ServiceHandler } from "nats";
import { NatsTracer } from "./NatsTracer.js";
import { Span } from "@opentelemetry/api";

type NatsServiceOperationHandler<
  M extends ServiceMethodName = ServiceMethodName,
  P extends z.ZodType = z.ZodType,
  R extends z.ZodType = z.ZodType,
  S extends ServiceRpcSubject = ServiceRpcSubject,
  D extends Record<string, string> = Record<string, string>,
  O extends ServiceOperation<M, P, R, S> = ServiceOperation<M, P, R, S>,
> = {
  (input: {
    error: NatsError | null;
    msg: Msg;
    span: Span;
    operation: O;
    metadata: D;
    params: z.infer<P>;
  }): Promise<z.infer<R>>;
};

type NatsServiceOperationEntry<
  M extends ServiceMethodName = ServiceMethodName,
  P extends z.ZodType = z.ZodType,
  R extends z.ZodType = z.ZodType,
  S extends ServiceRpcSubject = ServiceRpcSubject,
  O extends ServiceOperation<M, P, R, S> = ServiceOperation<M, P, R, S>,
  D extends Record<string, string> = Record<string, string>,
  H extends NatsServiceOperationHandler<
    M,
    P,
    R,
    S,
    D,
    O
  > = NatsServiceOperationHandler<M, P, R, S, D, O>,
> = {
  operation: O;
  metadata: D;
  handler: H;
  // queue?: TODO
};

function handler<
  O extends ServiceOperation<
    ServiceMethodName,
    z.ZodType,
    z.ZodType,
    ServiceRpcSubject
  >,
  D extends Record<string, string>,
  H extends NatsServiceOperationHandler<
    O["method"],
    O["params"],
    O["result"],
    O["subject"],
    D,
    O
  >,
>(
  operation: O,
  metadata: D,
  handler: H,
): NatsServiceOperationEntry<
  O["method"],
  O["params"],
  O["result"],
  O["subject"],
  O,
  D,
  H
> {
  return { operation, metadata, handler };
}

export class NatsServiceWorker {
  constructor(
    protected service: string,
    protected version: string,
    protected logger: Logger,
    protected nats: NatsClient,
    private natsTracer: NatsTracer,
  ) {}

  public async addService(
    sd: ServiceDescriptor,
    ops: NatsServiceOperationEntry<any, any, any, any, any, any, any>[],
  ) {
    const nc = await this.nats.connect();

    const svcLogger = this.logger.with(sd);

    svcLogger.debug("adding service");

    const svc = await nc.services.add({
      name: sd.name,
      version: sd.version,
      description: sd.description,
      metadata: sd.metadata,
      // queue: TODO
    });

    svc.stopped.then((error) => {
      svcLogger.error(`service stopped`, {
        error,
      });
    });

    for (const entry of ops) {
      const handlerLogger = svcLogger.with({
        method: entry.operation.method,
        subject: entry.operation.subject,
        metadata: { ...sd.metadata, ...entry.metadata },
      });

      handlerLogger.debug("adding endpoint");

      svc.addEndpoint(entry.operation.subject, {
        metadata: entry.metadata,
        handler: this.createHandler(entry, svc, handlerLogger),
      });
    }
  }

  public handler<
    O extends ServiceOperation<
      ServiceMethodName,
      z.ZodType,
      z.ZodType,
      ServiceRpcSubject
    >,
    D extends Record<string, string>,
    H extends NatsServiceOperationHandler<
      O["method"],
      O["params"],
      O["result"],
      O["subject"],
      D,
      O
    >,
  >(
    operation: O,
    metadata: D,
    handler: H,
  ): NatsServiceOperationEntry<
    O["method"],
    O["params"],
    O["result"],
    O["subject"],
    O,
    D,
    H
  > {
    return { operation, metadata, handler };
  }

  protected createHandler(
    entry: NatsServiceOperationEntry,
    svc: Service,
    logger: Logger,
  ): ServiceHandler {
    return (error: NatsError | null, msg: Msg) => {
      this.natsTracer.withSpanForMsg(
        {
          operation: "receive",
          subject: msg.subject,
          msg,
          attributes: {
            "rpc.method": entry.operation.method,
          },
        },
        async (span) => {
          try {
            if (error) {
              logger.error(`Error received`, {
                error: error,
              });

              svc.stop(error).finally(() => {});
              return;
            }

            const data = msg.json();
            const params = entry.operation.params.parse(data);

            const res = await entry.handler({
              error,
              msg,
              span,
              operation: entry.operation,
              metadata: entry.metadata,
              params: params,
            });

            const result = entry.operation.result.parse(res);
            const payload = JSON.stringify(result);
            msg.respond(payload);
          } catch (error) {
            logger.error(`Error handling msg`, {
              error,
            });

            throw error;
          }
        },
      );
    };
  }
}

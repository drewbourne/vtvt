import * as z from "zod";

export const ServiceRpcSubject = z.templateLiteral([
  "fbt.",
  z.string().min(1),
  ".rpc.",
  z.string().min(1),
]);
export type ServiceRpcSubject = z.output<typeof ServiceRpcSubject>;

export const ServiceMethodName = z.string().min(1);
export type ServiceMethodName = z.output<typeof ServiceMethodName>;

export const ServiceOperation = z.object({
  method: ServiceMethodName,
  params: z.ZodType,
  result: z.ZodType,
  subject: ServiceRpcSubject,
});

export type ServiceOperation<
  Method extends ServiceMethodName,
  Params extends z.ZodType,
  Result extends z.ZodType,
  Subject extends ServiceRpcSubject,
> = {
  method: Method;
  params: Params;
  result: Result;
  subject: Subject;
};

export function serviceOperation<
  M extends ServiceMethodName,
  P extends z.ZodType,
  R extends z.ZodType,
  S extends ServiceRpcSubject,
>(definition: ServiceOperation<M, P, R, S>) {
  return definition;
}

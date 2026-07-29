import { Context } from "./Context.js";

type ContextRunner<T = unknown> = Pick<Context<T>, "run">;

/**
 * Run a function wrapped in the given contexts.
 *
 * ```tsx
 * const requestContext = new Context({ requestId });
 * const tenantContext = new Context({ tenantId });
 * const accountContext = new Context({ accountId });
 *
 * const result = await runWithContexts([
 *  requestContext,
 *  tenantContext,
 *  accountContext,
 * ], () => {
 *   const requestId = requestContext.get('requestId');
 *   const tenantId = tenantContext.get('tenantId');
 *   const accountId = accountContext.get('accountId');
 * });
 * ```
 */
export async function runWithContexts<Result>(
  contexts: ContextRunner<unknown>[],
  handler: () => Promise<Result>,
): Promise<Result> {
  const nested = contexts.reduceRight(
    (next, context) => () => context.run({}, next),
    () => handler(),
  );

  const result = nested();
  return result;
}

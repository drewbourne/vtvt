import { appContainer } from "@/container";
import { Context } from "@fbt/context";
import { Attributes, SpanStatusCode } from "@opentelemetry/api";
import { asValue, InferCradleFromContainer } from "awilix";

type ActionContainer = ReturnType<typeof createActionContainer>;

type ActionCradle = InferCradleFromContainer<ActionContainer>;

class ActionContext extends Context<{ container?: ActionContainer }> {
  get cradle(): ActionCradle {
    const container = this.get("container");

    if (!container) throw new Error("ActionContext no container defined");

    return container.cradle;
  }
}

const actionContext = new ActionContext({});

function createActionContainer(
  name: string,
  parent: { depth: number } = { depth: -1 },
  params: unknown[] = [],
) {
  const actionContainer = appContainer.createScope().register({
    root: asValue(parent.depth === -1 ? true : false),
    depth: asValue(parent.depth === -1 ? 0 : parent.depth + 1),
    logger: asValue(appContainer.resolve("loggerBase").getChild(name)),
    actionParams: asValue(params),
    ...(params?.[0] instanceof Request ? { request: asValue(params[0]) } : {}),
  });

  const { logger, root, depth } = actionContainer.cradle;

  logger.debug("createActionContainer", { root, depth, name });

  return actionContainer;
}

type ActionFn<Params extends unknown[], Result extends unknown> = (
  ...params: Params
) => Promise<Result>;

type ActionCreator<Params extends unknown[], Result extends unknown> = (
  cradle: ActionCradle,
) => ActionFn<Params, Result>;

type ActionOptions = {
  name: string;
  attributes?: Attributes;
};

/**
 * Run an action with a request-scoped DI container.
 *
 * @example
 * ```tsx
 * import { runAction } from '@/next/runAction';
 *
 * export const GET = runAction({ name:  'GET /api/path' }, ({ accountsClient }) => async (request: Request) => {
 *   const accounts = await accountsClient.listAccounts();
 *
 *   return Response.json(account);
 * })
 * ```
 */
export function runAction<Params extends unknown[], Result extends unknown>(
  options: ActionOptions,
  actionCreator: ActionCreator<Params, Result>,
): ActionFn<Params, Result> {
  return async (...params: Params) => {
    let parent = actionContext.get("container");

    let container = createActionContainer(options.name, parent?.cradle, params);

    const { tracer, logger } = container.cradle;

    const result = await tracer.startActiveSpan(
      options.name,
      { attributes: options.attributes ?? {} },
      (span) => {
        return actionContext.run({ container }, async () => {
          try {
            logger.debug(`runAction start`, { options });

            const container = actionContext.get("container")!;
            const action = actionCreator(container.cradle);
            const result = await action(...params);

            return result;
          } catch (error) {
            logger.error(`runAction error`, { options, error });

            span.recordException(error as Error);
            span.setStatus({ code: SpanStatusCode.ERROR });

            throw error;
          } finally {
            logger.debug(`runAction end`, { options });

            span.end();
          }
        });
      },
    );

    return result;
  };
}

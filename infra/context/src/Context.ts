import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Use AsyncLocalStorage to propagate values through a context tree.
 *
 * ```tsx
 * import { Context } from '@vibetreader/context';
 *
 * const context = new Context<{ outer?: number; inner?: number }>();
 *
 * context.run({ outer: 1 }, () => {
 *   const outer = context.get('outer'); // 1
 *
 *   context.run({ inner: 2 }, () => {
 *     const outer = context.get('outer'); // 1
 *     const inner = context.get('inner'); // 2
 *   });
 * });
 * ```
 */
export class Context<T> {
  constructor(
    private readonly initialValues: T,
    private readonly asyncLocalStorage: AsyncLocalStorage<T> = new AsyncLocalStorage(),
  ) {}

  /**
   * Gets a value from the closest context
   *
   * ```tsx
   * import { Context } from '@vibetreader/context';
   *
   * const context = new Context<{ outer?: number; inner?: number }>();
   *
   * context.run({ outer: 1 }, () => {
   *   const outer = context.get('outer'); // 1
   *
   *   context.run({ inner: 2 }, () => {
   *     const outer = context.get('outer'); // 1
   *     const inner = context.get('inner'); // 2
   *   });
   * });
   * ```
   */
  get<K extends keyof T>(key: K): T[K] | undefined {
    const values = this.asyncLocalStorage.getStore() ?? this.initialValues;
    return values[key];
  }

  /**
   * Run a handler within the context.
   *
   * ```tsx
   * import { Context } from '@vibetreader/context';
   *
   * const context = new Context<{ outer?: number; inner?: number }>();
   *
   * context.run({ outer: 1 }, () => {
   *   const outer = context.get('outer'); // 1
   *
   *   context.run({ inner: 2 }, () => {
   *     const outer = context.get('outer'); // 1
   *     const inner = context.get('inner'); // 2
   *   });
   * });
   * ```
   */
  async run<Result>(
    values: Partial<T> = {},
    handler: () => Result | Promise<Result>,
  ): Promise<Result> {
    const store = {
      ...this.initialValues,
      ...this.asyncLocalStorage.getStore()!,
      ...values,
    };

    const result = await this.asyncLocalStorage.run(store, handler);

    return result;
  }

  /**
   * Creates a child context proxy that captures the given values and passes them to `run` when invoked.
   *
   * ```tsx
   * import { Context } from '@vibetreader/context';
   *
   * const context = new Context<{ outer?: number; inner?: number }>();
   *
   * const outer = context.of({ outer: 1 });
   * const inner = context.of({ inner: 2 });
   *
   * const result = outer.run({}, () => {
   *   return inner.run({}, () => {
   *     return [context.get('outer'), context.get('inner')];
   *   });
   * };
   * // [1, 2];
   * ```
   */
  of(values: Partial<T> = {}): Pick<Context<T>, "run"> {
    const ctx = this;

    return {
      async run<Result>(
        runValues: Partial<T> = {},
        handler: () => Result | Promise<Result>,
      ): Promise<Result> {
        return ctx.run({ ...values, ...runValues }, handler);
      },
    };
  }
}

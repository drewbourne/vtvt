import { describe, it, expect } from "vitest";
import { Context } from "./Context.js";

describe("@fbt/context/Context", () => {
  it("gets values from initial values", () => {
    const ctx = new Context({ name: "test", value: 123 });
    expect(ctx.get("name")).toEqual("test");
    expect(ctx.get("value")).toEqual(123);
  });

  it("gets values from run values", async () => {
    const ctx = new Context({ root: 1, outer: 0, inner: 0 });

    const result = await ctx.run({ outer: 2 }, () => {
      return ctx.run({ inner: 3 }, () => {
        const root = ctx.get("root");
        const outer = ctx.get("outer");
        const inner = ctx.get("inner");
        const values = { root, outer, inner };
        return values;
      });
    });

    expect(result).toEqual({ root: 1, outer: 2, inner: 3 });
  });

  it("gets values from closest context of the same tree", async () => {
    const ctxA = new Context({ name: "a", value: 1 });
    const ctxB = new Context({ name: "b", value: 2 });

    const result = await ctxA.run({}, () => {
      return ctxB.run({}, () => {
        return ctxA.run({ value: 3 }, () => {
          return ctxB.run({ value: 4 }, () => {
            return {
              [ctxA.get("name")!]: ctxA.get("value"),
              [ctxB.get("name")!]: ctxB.get("value"),
            };
          });
        });
      });
    });

    expect(result).toEqual({ a: 3, b: 4 });
  });
});

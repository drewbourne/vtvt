import { describe, it, expect } from "vitest";
import { Context } from "./Context.js";
import { runWithContexts } from "./runWithContexts.js";

class RequestContext extends Context<{ requestId: string }> {
  get requestId(): string | undefined {
    return this.get("requestId");
  }
}

class TenantContext extends Context<{ tenantId: string }> {
  get tenantId(): string | undefined {
    return this.get("tenantId");
  }
}
class AccountContext extends Context<{ accountId: string }> {
  get accountId(): string | undefined {
    return this.get("accountId");
  }
}

describe("@fbt/context/runWithContexts", () => {
  it("runs a single context around the given function", async () => {
    const requestContext = new RequestContext({ requestId: "req-001" });

    const result = await runWithContexts([requestContext], () => {
      return Promise.resolve([requestContext.requestId]);
    });

    expect(result).toEqual(["req-001"]);
  });

  it("runs multiple contexts around the given function", async () => {
    const requestContext = new RequestContext({ requestId: "req-001" });
    const tenantContext = new TenantContext({ tenantId: "tenant-002" });
    const accountContext = new AccountContext({ accountId: "account-003" });

    const result = await runWithContexts(
      [requestContext, tenantContext, accountContext],
      () => {
        return Promise.resolve([
          requestContext.requestId,
          tenantContext.tenantId,
          accountContext.accountId,
        ]);
      },
    );

    expect(result).toEqual(["req-001", "tenant-002", "account-003"]);
  });

  it("runs multiple nested contexts around the given function", async () => {
    const tenantContext = new TenantContext({ tenantId: "000" });

    const result = await runWithContexts(
      [tenantContext.of({ tenantId: "001" })],
      async () => {
        const values = [tenantContext.tenantId];

        const result = await runWithContexts(
          [tenantContext.of({ tenantId: "002" })],
          async () => {
            return [tenantContext.tenantId];
          },
        );

        return [...values, ...result];
      },
    );

    expect(result).toEqual(["001", "002"]);
  });
});

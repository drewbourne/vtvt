# @fbt/context: Context

Use `AsyncLocalStorage` to propagate values through the execution stack.

## Usage

```tsx
import { Context, runWithContexts } from "@fbt/context";

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

const requestContext = new RequestContext({ requestId: undefined });
const tenantContext = new TenantContext({ tenantId: undefined });
const accountContext = new AccountContext({ accountId: undefined });

const result = await runWithContexts(
  [
    requestContext.of({ request: "req-001" }),
    tenantContext.of({ tenantId: "tnt-002" }),
    accountContext.of({ accountId: "acc-003" }),
  ],
  () => {
    const requestId = requestContext.requestId;
    const tenantId = tenantContext.tenantId;
    const accountId = accountContext.accountId;
    return { requestId, tenantId, accountId };
  },
);
```

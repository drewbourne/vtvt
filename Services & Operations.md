# Services & Operations

In the architecture of this project there will be a strict separation of application code and services code.
Application code will use a Service Client to invoke methods which will sent a NATS message.
The Service Worker will run as a standalone instance, and will subscribe to NATS subjects, then invoke the target method on the Service instance.

## Services

A Service is a class with async methods. Each method typically takes one parameter and returns a Promise for the result.

```ts
// accounts/services/AccountsService.ts
class AccountsService {
  constructor(
    private runAction: RunAction,
    private accountsRepository: AccountsRepository,
  ) {}

  listAccounts(request: ListAccountsRequest): Promise<ListAccountsResult> {
    return runAction("listAccounts", ({ logger, tracer, metrics }) => {
      const result = this.accountsRepository.query(request);

      logger.set("accounts.list.request", request);
      logger.set("acccount.list.result.length", result.length);

      return result;
    });
  }
}
```

## Operations

- An Operation is a definition of a service method suitable for type-checking and runtime validation:
  - A method name for the operation
  - A subject for the RPC call over NATS
  - An array of params schemas
  - A result schema object

```ts
import * as z from "zod";

// accounts/operations/listAccounts.ts
export const ListAccountsRequest = z.object({
  filters: z.object({}),
  sorts: z.object({}),
  limit: z.object({}),
  offset: z.number(),
});

export const ListAccountsResult = z.object({
  count: z.number(),
  accounts: z.array(z.object({ name: z.string(), balance: z.number() })),
});

export type ListAccountsRequest = z.infer<typeof ListAccountsRequest>;
export type ListAccountsResult = z.infer<typeof ListAccountsResult>;

export const listAccountsOperation = operation({
  method: "listAccounts",
  subject: "fbt.accounts.rpc.listAccounts",
  params: ListAccountsRequest,
  result: ListAccountsResult,
});
```

## Service Workers

A Service Worker (or Worker) will be run as standalone app and will instantiate a service, connect to NATS, subscribe to the subjects of the operations for that service, and calls between NATS and the service instance.

```tsx
// accounts/services/AccountsServiceNatsWorker.ts
class AccountsServiceNatsWorker {
  constructor(
    private runAction: RunAction,
    private nats: NatsService,
    private accountsService: AccountsService,
    private accountsOperations: Operation[],
  ) {}

  start() {
    const nats = await this.nats.connect();

    for (const operation of this.accountsOperations) {
      this.startOperation(operation, nats);
    }
  }

  startOperation(operation, { nc, jc }) {
    const sub = nc.subscribe(operation.subject);
    (async () => {
      for await (const msg of sub) {
        await runAction(operation.method, ({ logger, tracer, metrics }) => {
          const params = operation.request.parse(msg.json());
          const output = await this.accountsService[operation.method](params);
          const result = operation.result.parse(output);
          msg.respond(result);
        });
      }
    })();
    nc.flush();
  }
}
```

## Service Clients

A Service Client (or Client) will provide an adapter/facade that will provide a set of methods for invoking the service via RPC calls over NATS.

```tsx
// accounts/services/AccountServiceNatsClient.ts
class AccountServiceNatsClient {
  constructor(
    private runAction: RunAction,
    private nats: NatsService,
  ) {}

  listAccounts(request: ListAccountsRequest): Promise<ListAccountsResult> {
    return runAction(
      listAccountsOperation.method,
      ({ logger, tracer, metrics }) => {
        const params = operation.params.parse(request);
        const output = await nats.rpc(listAccountsOperation, params);
        const result = operation.result.parse(output);
        return result;
      },
    );
  }
}
```

## NatsClientProxy

To simplify the creation/maintenance of Service Clients this project will use `Proxy` to create clients from the given operations.

```tsx
class AccountsServiceNatsClient extends NatsClientProxy.from(
  accountsOperations,
) {}

class NatsClientProxy<T extends Operation[]> {
  static from<O extends Operation[]>(operations: O): NatsClientProxy<O> {
    return class extends NatsClientProxy {};
  }
}
```

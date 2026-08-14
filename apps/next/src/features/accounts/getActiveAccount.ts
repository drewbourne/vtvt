import { runAction } from "@/next/runAction";
import { cache } from "react";

export const getActiveAccount = cache(
  runAction({ name: "getActiveAccount" }, ({ accountsClient }) => async () => {
    const result = await accountsClient.listAccounts({});
    if (result.status === "success" && result.count > 0) {
      const account = result.items[0]!;
      return account;
    }
    return null;
  }),
);

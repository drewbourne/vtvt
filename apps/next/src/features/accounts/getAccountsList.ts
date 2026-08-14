import { runAction } from "@/next/runAction";
import { cache } from "react";

export const getAccountsList = cache(
  runAction({ name: "getAccountsList" }, ({ accountsClient }) => async () => {
    const result = await accountsClient.listAccounts({});
    if (result.status === "success" && result.count > 0) {
      return result.items;
    }
    return null;
  }),
);

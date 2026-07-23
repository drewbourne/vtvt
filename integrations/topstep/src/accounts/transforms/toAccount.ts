import {
  Account,
  AccountId,
  BrokerAccountId,
  BrokerId,
} from "@fbt/accounts/models";
import { TradingAccountModel } from "@fbt/topstepx-api/gateway";

export function toAccount(topstepAccount: TradingAccountModel): Account {
  return {
    id: AccountId.parse(`account:topstep:${topstepAccount.id}`),
    brokerId: BrokerId.parse("topstep"),
    brokerAccountId: BrokerAccountId.parse(topstepAccount.id),
    name: topstepAccount.name,
    balance: topstepAccount.balance,
    canTrade: topstepAccount.canTrade,
    isVisble: topstepAccount.isVisible,
    // env: 'sim' | 'live',
  };
}

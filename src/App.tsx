import * as React from 'react';
import Login from './login';
import { Balance } from 'types';
import {
  ws,
  get_balance,
  subscribe_tickers,
  subscribe_balance,
  subscribe_orders
} from 'api';
import { process_balance } from 'utils';
import UBLogo from 'components/src/ub-logo';
import TickerManager, { TickerDetailedInfo } from './tickers/tickers_manager';

export const AppContext = React.createContext<{
  balance: { [key: string]: TickerDetailedInfo };
  set_balance: React.Dispatch<
    React.SetStateAction<{
      [key: string]: TickerDetailedInfo;
    }>
  >;
}>({
  balance: {},
  set_balance: () => {}
});

export default () => {
  const [balance, set_balance] = React.useState<{
    [key: string]: TickerDetailedInfo;
  }>({});

  const [fetching, set_fetching] = React.useState(true);

  const finish_login_cb = async () => {
    const tickers = await update_balance();
    set_fetching(false);
    /**
     * 订阅余额变化
     */
    subscribe_balance(update_balance);
    /**
     * 订阅订单变化
     */
    subscribe_orders();
    /**
     * 订阅价格变化
     */
    subscribe_tickers(Object.keys(tickers).map(t => `${t}_USDT`));
  };

  const update_balance = async () => {
    const balance = await get_balance();
    const tickers = process_balance(balance.result);
    set_balance(tickers);
    return tickers;
  };

  console.log('app render!');

  return (
    <AppContext.Provider
      value={{
        balance,
        set_balance
      }}
    >
      {fetching ? <UBLogo size={50}></UBLogo> : null}
      {Object.keys(balance).length ? (
        <TickerManager tickers={balance}></TickerManager>
      ) : null}

      <Login finish_login_cb={finish_login_cb}></Login>
    </AppContext.Provider>
  );
};

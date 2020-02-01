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
import { aggregate_balance } from 'utils';
import UBLogo from 'components/src/ub-logo';
import TickerManager, { TickerDetailedInfo } from './tickers/tickers_manager';
import { get_mem_store } from './mem_store';

export const AppContext = React.createContext<{
  balance: { [key: string]: TickerDetailedInfo };
  set_balance: React.Dispatch<React.SetStateAction<Balance>>;
  // is_visitor: boolean;
  // set_is_visitor: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  balance: {},
  set_balance: () => {}
  // is_visitor: false,
  // set_is_visitor: () => {}
});

export default () => {
  const [balance, set_balance] = React.useState<Balance>({});
  // const [is_visitor, set_is_visitor] = React.useState(false);

  const [fetching, set_fetching] = React.useState(true);

  const finish_login_cb = async () => {
    // console.log(is_visitor);
    const tickers = await update_balance();
    set_fetching(false);
    if (!get_mem_store('is_visitor')) {
      /**
       * 订阅余额变化
       */
      subscribe_balance(update_balance);
      /**
       * 订阅订单变化
       */
      subscribe_orders();
    }
    /**
     * 订阅价格变化
     */
    subscribe_tickers(Object.keys(tickers).map(t => `${t}_USDT`));
  };

  const update_balance = async () => {
    const data = await get_balance();
    set_balance(old_balance => aggregate_balance(data.result, old_balance));
    return data.result;
  };

  return (
    <AppContext.Provider
      value={{
        balance,
        set_balance
        // is_visitor,
        // set_is_visitor
      }}
    >
      {fetching ? (
        <div className='tac mt-3'>
          <UBLogo size={30}></UBLogo>
        </div>
      ) : null}
      {Object.keys(balance).length ? (
        <TickerManager tickers={balance}></TickerManager>
      ) : null}

      <Login finish_login_cb={finish_login_cb}></Login>
    </AppContext.Provider>
  );
};

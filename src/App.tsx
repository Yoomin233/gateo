import * as React from 'react';
import Login from './login';
import { Balance, TickerInfo } from 'types';
import {
  get_balance,
  subscribe_tickers,
  subscribe_balance,
  subscribe_orders,
  subscribe_ws
} from 'api';
import { aggregate_balance, set_balance_info } from 'utils';
import UBLogo from 'components/src/ub-logo';
import TickerManager, { TickerDetailedInfo } from './tickers/tickers_manager';
import { get_mem_store, set_mem_store } from './mem_store';

export type ws_status =
  | 'connecting'
  | 'disconnected'
  | 'online'
  | 'logging'
  | '';

export const AppContext = React.createContext<{
  balance: Balance;
  set_balance: React.Dispatch<React.SetStateAction<Balance>>;
  ws_status: ws_status;
  set_ws_status: React.Dispatch<React.SetStateAction<ws_status>>;
}>({
  balance: {},
  set_balance: () => {},
  ws_status: 'connecting',
  set_ws_status: (status: ws_status) => void 0
});

export default () => {
  const [balance, set_balance] = React.useState<Balance>({});
  const [status, set_ws_status] = React.useState<ws_status>('connecting');

  const [fetching, set_fetching] = React.useState(true);

  React.useEffect(() => {
    if (!window.Notification) return;
    Notification.requestPermission().then(res => {
      if (res !== 'denied') {
        set_mem_store('allow_notification', true);
      }
    });
  }, []);

  const finish_login_cb = async () => {
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

    /**
     * 订阅价格变化
     */
    subscribe_ws<{
      method: string;
      params: [string, TickerInfo];
      id: null;
    }>(data => {
      if (data.method === 'ticker.update') {
        set_balance(tickers => {
          const incoming_name = data.params[0];
          for (let i in tickers) {
            if (`${i}_USDT` !== incoming_name) continue;
            tickers[i] = set_balance_info(tickers[i], data.params[1]);
          }
          return { ...tickers };
        });
      }
    });
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
        set_balance,
        ws_status: status,
        set_ws_status
      }}
    >
      {fetching ? (
        <div className='tac mt-3'>
          <UBLogo size={30}></UBLogo>
        </div>
      ) : (
        <TickerManager tickers={balance}></TickerManager>
      )}
      <Login finish_login_cb={finish_login_cb}></Login>
    </AppContext.Provider>
  );
};

import * as React from 'react';
import Login from './login';
import { Balance, FinishedOrderInfo } from 'types';
import {
  get_balance,
  subscribe_tickers,
  subscribe_balance,
  subscribe_orders
} from 'api';
import {
  aggregate_balance,
  aggregate_price,
  ask_notification_permit
} from 'utils';
import UBLogo from 'components/src/ub-logo';
import Prices from './tickers/prices';
import { get_mem_store } from './mem_store';
import Footer from './footer';
import FinishedOrders from './finished_orders';
import Loading from './loading';

export type ws_status =
  | 'connecting'
  | 'disconnected'
  | 'online'
  | 'logging'
  | '';

export type tab_status = 'price' | 'executed' | 'finished';

export const AppContext = React.createContext<{
  balance: Balance;
  set_balance: React.Dispatch<React.SetStateAction<Balance>>;
  ws_status: ws_status;
  set_ws_status: React.Dispatch<React.SetStateAction<ws_status>>;
  selected_tab: tab_status;
  set_selected_tab: React.Dispatch<React.SetStateAction<tab_status>>;
  finished_orders: {
    [key: string]: FinishedOrderInfo[];
  };
  set_finished_orders: React.Dispatch<
    React.SetStateAction<{
      [key: string]: FinishedOrderInfo[];
    }>
  >;
}>({
  balance: {},
  set_balance: () => void 0,
  ws_status: 'connecting',
  set_ws_status: (status: ws_status) => void 0,
  selected_tab: 'price',
  set_selected_tab: () => void 0,
  finished_orders: {},
  set_finished_orders: () => void 0
});

export default () => {
  const [balance, set_balance] = React.useState<Balance>({});
  const [status, set_ws_status] = React.useState<ws_status>('connecting');
  const [tab_status, set_tab_status] = React.useState<tab_status>('price');
  const [finished_orders, set_fiished_orders] = React.useState<{
    [key: string]: FinishedOrderInfo[];
  }>({});

  const [fetching, set_fetching] = React.useState(true);

  React.useEffect(() => {
    ask_notification_permit();
  }, []);

  const finish_login_cb = async () => {
    const tickers = await update_balance();
    const tickers_arr = Object.keys(tickers).map(t => `${t}_USDT`);
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
    subscribe_tickers(tickers_arr, data =>
      set_balance(tickers => aggregate_price(tickers, data))
    );
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
        set_ws_status,
        selected_tab: tab_status,
        set_selected_tab: set_tab_status,
        set_finished_orders: set_fiished_orders,
        finished_orders
      }}
    >
      {fetching ? (
        <Loading></Loading>
      ) : (
        <>
          <Prices tickers={balance}></Prices>
          <FinishedOrders></FinishedOrders>
        </>
      )}
      <Login finish_login_cb={finish_login_cb}></Login>
      <Footer></Footer>
    </AppContext.Provider>
  );
};

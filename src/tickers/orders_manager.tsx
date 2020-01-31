import * as React from 'react';
import { FinishedOrderInfo, PendingOrderInfo } from 'types';
import FinishedOrder from './finished_order';
import PendingOrder from './pending_order';
import { TickerDetailedInfo } from './tickers_manager';
import { query_orders, subscribe_ws, http_get_finished_orders } from 'api';
import { AppContext } from 'App';
import UBLogo from 'components/src/ub-logo';

interface Props {
  ticker: TickerDetailedInfo;
  expand: boolean;
}

const OrdersManager = (prop: Props) => {
  const { ticker, expand } = prop;

  const { is_visitor } = React.useContext(AppContext);

  const [pending_orders, set_pending_orders] = React.useState<
    PendingOrderInfo[]
  >([]);
  const [finished_orders, set_finished_orders] = React.useState<
    FinishedOrderInfo[]
  >([]);

  const ticker_full_name = `${ticker.ticker}_USDT`;

  const [pending_orders_fetched, set_pending_orders_fetched] = React.useState(
    false
  );

  const get_pending_orders = async () => {
    if (is_visitor) return set_pending_orders_fetched(true);
    const orders = await query_orders(ticker_full_name);
    set_pending_orders(orders.result.records);
    set_pending_orders_fetched(true);
  };

  const [finished_orders_fetched, set_finished_orders_fetched] = React.useState(
    false
  );

  const get_finished_orders = async () => {
    set_finished_orders_fetched(false);
    if (is_visitor) return set_finished_orders_fetched(true);
    const orders = await http_get_finished_orders(ticker_full_name);
    if (orders.code === 0) set_finished_orders(orders.trades);
    set_finished_orders_fetched(true);
  };

  React.useEffect(() => {
    let unsubscriber;
    if (expand) {
      get_pending_orders();
      unsubscriber = subscribe_ws<{ params: [number, PendingOrderInfo] }>(
        data => {
          if (data.method === 'order.update') {
            const [, order] = data.params;
            if (order.market === ticker_full_name) {
              get_pending_orders();
            }
          }
        }
      );
      if (!finished_orders_fetched) {
        get_finished_orders();
      }
    } else {
      unsubscriber && unsubscriber();
    }
  }, [expand]);

  const loading = (
    <p className='tac'>
      <UBLogo size={20}></UBLogo>
    </p>
  );

  return (
    <>
      <div
        className='flexSpread ticker-details'
        style={{
          display: expand ? 'flex' : 'none'
        }}
      >
        <div>
          <p className='tac f-b framed'>
            Latest Orders&nbsp;
            <span onClick={get_finished_orders} className='fs-1 cp'>
              Refresh
            </span>
          </p>
          <div className='table'>
            <p>
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
              <span>Direction</span>
              <span>Time</span>
              <span>Margin</span>
            </p>
            {!finished_orders_fetched ? (
              loading
            ) : finished_orders.length ? (
              finished_orders.map(o => (
                <FinishedOrder
                  key={o.tradeID}
                  order={o}
                  ticker={ticker}
                ></FinishedOrder>
              ))
            ) : (
              <p className='tac'>No Records!</p>
            )}
          </div>
        </div>
        <div>
          <p className='tac f-b framed'>Pending Orders</p>
          <div className='table'>
            <p>
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
              <span>Direction</span>
              <span>Cancel</span>
            </p>
            {!pending_orders_fetched ? (
              loading
            ) : pending_orders.length ? (
              <>
                {pending_orders
                  .filter(o => o.type === 1)
                  .sort((oa, ob) => Number(ob.price) - Number(oa.price))
                  .map(o => (
                    <PendingOrder key={o.ctime} order={o}></PendingOrder>
                  ))}
                {pending_orders
                  .filter(o => o.type === 2)
                  .sort((oa, ob) => Number(ob.price) - Number(oa.price))
                  .map(o => (
                    <PendingOrder key={o.ctime} order={o}></PendingOrder>
                  ))}
              </>
            ) : (
              <p className='tac'>No Records!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersManager;

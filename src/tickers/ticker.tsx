import * as React from 'react';
import { Balance, FinishedOrderInfo, PendingOrderInfo } from 'types';
import {
  subscribe_tickers,
  subscribe_ws,
  query_ticker,
  query_orders as query_pending_orders,
  http_get_finished_orders
} from 'api';
import { TickerDetailedInfo } from './tickers_manager';
import PendingOrder from './pending_order';
import Number from './number';
import FinishedOrder from './finished_order';
import Button from 'components/src/button';
import TickerOrders from './orders';

interface Props {
  ticker: TickerDetailedInfo;
  idx: number;
}

const Ticker = (prop: Props) => {
  // console.log('render!');
  const { ticker } = prop;

  const last_price = React.useRef(0);
  const [rise, set_rise] = React.useState('');
  const orders_fetched = React.useRef(false);

  const [expand, set_expand] = React.useState(false);
  const [pending_orders, set_pending_orders] = React.useState<
    PendingOrderInfo[]
  >([]);
  const [finished_orders, set_finished_orders] = React.useState<
    FinishedOrderInfo[]
  >([]);

  const ticker_full_name = `${ticker.ticker}_USDT`;

  React.useEffect(() => {
    if (last_price.current > ticker.price && last_price.current) {
      set_rise('rise');
    } else if (last_price.current) {
      set_rise('fall');
    }
    setTimeout(() => {
      set_rise('');
    }, 2500);
    last_price.current = ticker.price;
  }, [ticker.price]);

  const get_pending_orders = async () => {
    const orders = await query_pending_orders(ticker_full_name);
    set_pending_orders(orders.result.records);
  };

  const get_finished_orders = async () => {
    const orders = await http_get_finished_orders(ticker_full_name);
    set_finished_orders(orders.trades);
    orders_fetched.current = true;
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
      if (!orders_fetched.current) {
        get_finished_orders();
      }
    } else {
      unsubscriber && unsubscriber();
    }
  }, [expand]);

  return (
    <div className={`ticker-wrapper ${rise}`}>
      <p onClick={() => set_expand(e => !e)}>
        <span>{ticker.ticker}/USDT</span>
        <span>{ticker.available.toFixed(4)}</span>
        <span>{ticker.freeze.toFixed(4)}</span>
        <span className='f-b'>{ticker.price} USDT</span>
        <Number num={ticker.change}>%</Number>
        <span>{ticker.usdt_amount.toFixed(2)}</span>
      </p>
      {expand ? (
        <TickerOrders
          finished_orders={finished_orders}
          pending_orders={pending_orders}
          get_finished_orders={get_finished_orders}
          ticker={ticker}
        ></TickerOrders>
      ) : null}
    </div>
  );
};

export default React.memo(Ticker);

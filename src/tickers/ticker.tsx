import * as React from 'react';
import { Balance, FinishedOrderInfo, PendingOrderInfo } from 'types';
import {
  subscribe_ws,
  query_orders as query_pending_orders,
  http_get_finished_orders
} from 'api';
import { TickerDetailedInfo } from './tickers_manager';
import Number from './number';
import OrdersManager from './orders_manager';
import TradeManager from './trade_manager';

interface Props {
  ticker: TickerDetailedInfo;
  idx: number;
}

const Ticker = (prop: Props) => {
  // console.log('render!');
  const { ticker } = prop;

  const last_price = React.useRef(0);
  const [rise, set_rise] = React.useState('');

  const [expand_order, set_expand_order] = React.useState(false);
  const [expand_trade, set_expand_trade] = React.useState(false);

  React.useEffect(() => {
    if (last_price.current > ticker.price && last_price.current) {
      set_rise('fall');
    } else if (last_price.current) {
      set_rise('rise');
    }
    setTimeout(() => {
      set_rise('');
    }, 2500);
    last_price.current = ticker.price;
  }, [ticker.price]);

  return (
    <div className={`ticker-wrapper ${rise}`}>
      <p>
        <span>{ticker.ticker}/USDT</span>
        <span>{ticker.available.toFixed(4)}</span>
        <span>{ticker.freeze.toFixed(4)}</span>
        <span className='f-b'>{ticker.price} USDT</span>
        <Number num={ticker.change}>%</Number>
        <span>{ticker.usdt_amount.toFixed(2)}</span>
        <span className='cp f-b'>
          <span
            onClick={e => {
              set_expand_trade(!expand_trade);
            }}
          >
            Trade {expand_trade ? '↓' : '>'}
          </span>
          <br></br>
          <span
            onClick={e => {
              set_expand_order(!expand_order);
            }}
          >
            Order {expand_order ? '↓' : '>'}
          </span>
        </span>
      </p>
      <TradeManager ticker={ticker} expand={expand_trade}></TradeManager>
      <OrdersManager ticker={ticker} expand={expand_order}></OrdersManager>
    </div>
  );
};

export default React.memo(Ticker);

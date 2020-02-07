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
import Button from 'components/src/button';
import KLine from './k_line';

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
  const [expand_k_line, set_expand_k_line] = React.useState(false);

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
        <span>
          {ticker.ticker}
          <br />
          <span>/USDT</span>
        </span>
        <span className='f-b'>
          {ticker.price}
          <br />
          <Number num={ticker.change} pre={'/'}>
            %
          </Number>
        </span>

        <span>{ticker.usdt_amount.toFixed(2)}</span>
        <span className='cp f-b'>
          <Button
            onClick={e => {
              set_expand_k_line(!expand_k_line);
            }}
          >
            K{expand_k_line ? '↓' : '>'}
          </Button>
          &nbsp;
          <Button
            onClick={e => {
              set_expand_trade(!expand_trade);
            }}
          >
            T{expand_trade ? '↓' : '>'}
          </Button>
          &nbsp;
          <Button
            onClick={e => {
              set_expand_order(!expand_order);
            }}
          >
            O{expand_order ? '↓' : '>'}
          </Button>
        </span>
      </p>
      <KLine ticker={ticker} expand={expand_k_line}></KLine>
      <TradeManager ticker={ticker} expand={expand_trade}></TradeManager>
      <OrdersManager ticker={ticker} expand={expand_order}></OrdersManager>
    </div>
  );
};

export default React.memo(Ticker);

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
  // idx: number;
  collapse_all: boolean;
}

const Ticker = (prop: Props) => {
  // console.log('render!');
  const { ticker, collapse_all } = prop;

  const last_price = React.useRef(0);
  const [rise, set_rise] = React.useState('');

  React.useEffect(() => {
    set_expand_k_line(false);
    set_expand_order(false);
    set_expand_trade(false);
  }, [collapse_all]);

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
        <span className='f-b'>
          {ticker.ticker}
          <br />
          <span>/USDT</span>
        </span>
        <span className='f-b'>
          {ticker.price}
          <br />
          <Number num={ticker.change}>%</Number>
        </span>

        <span>{ticker.usdt_amount.toFixed(2)}</span>
        <span className='cp f-b'>
          <Button
            onClick={e => {
              set_expand_k_line(!expand_k_line);
            }}
            className={expand_k_line ? 'expanded' : ''}
          >
            <img src={require('../assets/candle-sticks.png')}></img>
          </Button>
          &nbsp;
          <Button
            onClick={e => {
              set_expand_trade(!expand_trade);
            }}
            className={expand_trade ? 'expanded' : ''}
          >
            <img src={require('../assets/trade.png')}></img>
          </Button>
          &nbsp;
          <Button
            onClick={e => {
              set_expand_order(!expand_order);
            }}
            className={expand_order ? 'expanded' : ''}
          >
            <img src={require('../assets/bill.png')}></img>
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

import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import Button from 'components/src/button';
import { http_cancel_order } from 'api';
import { TickerDetailedInfo } from './tickers_manager';

interface Props {
  order: FinishedOrderInfo;
  ticker: TickerDetailedInfo;
}

const FinishedOrder = (prop: Props) => {
  const { order, ticker } = prop;
  const bg_classname = order.type === 'sell' ? 'bg_red' : 'bg_green';
  const margin = ticker.price * Number(order.amount) - order.total;
  return (
    <p className={bg_classname}>
      <span className='f-b'>{order.rate}</span>
      <span>{order.amount}</span>
      <span>{order.total.toFixed(2)}</span>
      <span>{order.type === 'sell' ? 'Sell' : 'Buy'}</span>
      <span>{order.date}</span>
      {order.type === 'sell' ? (
        <span></span>
      ) : (
        <span>
          {margin > 0 ? '⬆' : margin < 0 ? '⬇' : '~'}
          {margin.toFixed(2)}
        </span>
      )}
    </p>
  );
};

export default FinishedOrder;

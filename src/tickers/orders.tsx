import * as React from 'react';
import { FinishedOrderInfo, PendingOrderInfo } from 'types';
import FinishedOrder from './finished_order';
import PendingOrder from './pending_order';
import { TickerDetailedInfo } from './tickers_manager';

interface Props {
  finished_orders: FinishedOrderInfo[];
  pending_orders: PendingOrderInfo[];
  get_finished_orders: () => void;
  ticker: TickerDetailedInfo;
}

const TickerOrders = (prop: Props) => {
  const { finished_orders, pending_orders, get_finished_orders, ticker } = prop;
  return (
    <div className='flexSpread ticker-details'>
      <div>
        <p className='tac f-b framed'>
          Latest Orders&nbsp;
          <span onClick={get_finished_orders} className='fs-1'>
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
          {finished_orders.length ? (
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
            <span>Withdraw</span>
          </p>
          {pending_orders.length ? (
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
  );
};

export default TickerOrders;

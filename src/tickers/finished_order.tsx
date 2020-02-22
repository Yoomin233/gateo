import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import Button from 'components/src/button';
import { http_cancel_order } from 'api';
import { TickerDetailedInfo } from './tickers_manager';
import { get_x_days_ago } from 'utils';
import PlaceReverseOrder from './place_reverse_order';

interface Props {
  order: FinishedOrderInfo;
  ticker: TickerDetailedInfo;
}

const FinishedOrder = (prop: Props) => {
  const { order, ticker } = prop;

  const [reverse_show, set_reverse_show] = React.useState(false);

  const bg_classname = order.type === 'sell' ? 'bg_red' : 'bg_green';
  const margin = ticker.price * Number(order.amount) - order.total;
  const days_ago = get_x_days_ago(order.time_unix * 1000);
  return (
    <>
      <p className={bg_classname}>
        <span className='f-b'>{order.rate}</span>
        <span>{order.amount}</span>
        <span>{order.total.toFixed(2)}</span>
        <span>{order.type === 'sell' ? 'Sell' : 'Buy'}</span>
        <span>{days_ago <= 0 ? 'Recently' : days_ago}</span>
        {order.type === 'sell' ? (
          <span></span>
        ) : (
          <span>
            {margin > 0 ? '⬆' : margin < 0 ? '⬇' : '~'}
            {margin.toFixed(2)}
          </span>
        )}
        {/* <span>
          <Button onClick={() => set_reverse_show(true)}>Reverse</Button>
        </span> */}
      </p>
      {/* <PlaceReverseOrder
        order={order}
        show={reverse_show}
        dismiss={() => set_reverse_show(false)}
      ></PlaceReverseOrder> */}
    </>
  );
};

export default FinishedOrder;

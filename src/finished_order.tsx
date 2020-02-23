import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import { TickerDetailedInfo } from './tickers/prices';
import { get_x_days_ago, get_ticker_balance, get_ticker } from 'utils';
import { AppContext } from 'App';

interface Props {
  order: FinishedOrderInfo;
  // ticker: TickerDetailedInfo;
}

const FinishedOrder = (prop: Props) => {
  const { order } = prop;

  const [reverse_show, set_reverse_show] = React.useState(false);

  const { balance } = React.useContext(AppContext);

  const bg_classname = order.type === 'sell' ? 'bg_red' : 'bg_green';
  const margin =
    get_ticker_balance(balance, get_ticker(order.pair), 'price') *
      Number(order.amount) -
    order.total;
  const days_ago = get_x_days_ago(order.time_unix * 1000);
  return (
    <>
      <p className={bg_classname}>
        <span>{get_ticker(order.pair).toUpperCase()}</span>
        <span className='f-b'>{order.rate}</span>
        <span>{Number(order.amount).toFixed(2)}</span>
        <span>{order.total.toFixed(2)}</span>
        <span>{order.type === 'sell' ? 'Sell' : 'Buy'}</span>
        <span>{days_ago}</span>
        {order.type === 'sell' ? (
          <span></span>
        ) : (
          <span>
            {margin > 0 ? '↑' : margin < 0 ? '↓' : '~'}
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

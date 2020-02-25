import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import { get_x_days_ago, get_ticker_balance, get_ticker } from 'utils';
import { AppContext } from 'App';
import Button from 'components/src/button';
import PlaceReverseOrder from './place_reverse_order';
import ColorNum from '../gadgets/num';

interface Props {
  order: FinishedOrderInfo;
  // ticker: TickerDetailedInfo;
}

const FinishedOrder = (prop: Props) => {
  const { order } = prop;

  const [reverse_show, set_reverse_show] = React.useState(false);

  const { balance } = React.useContext(AppContext);

  const bg_classname = order.type === 'sell' ? 'bg_green' : 'bg_red';
  const margin =
    get_ticker_balance(balance, get_ticker(order.pair), 'price') *
      Number(order.amount) -
    order.total;
  const days_ago = get_x_days_ago(order.time_unix * 1000);
  return (
    <>
      <p className={bg_classname}>
        <span>
          {order.type === 'sell' ? 'Sell' : 'Buy'}{' '}
          {get_ticker(order.pair).toUpperCase()}
        </span>
        <span className='f-b'>{order.rate}</span>
        {/* <span>{Number(order.amount).toFixed(2)}</span> */}
        <span>{order.total.toFixed(2)}</span>
        {/* <span>{order.type === 'sell' ? 'Sell' : 'Buy'}</span> */}
        <span>{days_ago}</span>
        {order.type === 'sell' ? (
          <span></span>
        ) : (
          <ColorNum num={margin}></ColorNum>
          // <span>
          //   {margin > 0 ? '↑' : margin < 0 ? '↓' : '~'}
          //   {margin.toFixed(2)}
          // </span>
        )}
        <span>
          <Button onClick={() => set_reverse_show(true)}>
            {order.type === 'sell' ? 'Buy' : 'Sell'}
          </Button>
        </span>
      </p>
      <PlaceReverseOrder
        order={order}
        show={reverse_show}
        dismiss={() => set_reverse_show(false)}
      ></PlaceReverseOrder>
    </>
  );
};

export default FinishedOrder;

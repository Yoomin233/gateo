import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import { get_x_days_ago, get_ticker_balance, get_ticker } from 'utils';
import { AppContext } from 'App';
import Button from 'components/src/button';
import PlaceReverseOrder from './place_reverse_order';
import ColorText from '../gadgets/num';

interface Props {
  order: FinishedOrderInfo;
  // ticker: TickerDetailedInfo;
}

const FinishedOrder = (prop: Props) => {
  const { order } = prop;

  const [reverse_show, set_reverse_show] = React.useState(false);

  const { balance } = React.useContext(AppContext);

  const margin =
    get_ticker_balance(balance, get_ticker(order.pair), 'price') *
      Number(order.amount) -
    order.total;
  const days_ago = get_x_days_ago(order.time_unix * 1000);
  return (
    <>
      <p>
        {/* <span> */}
        <ColorText red={order.type === 'buy'}>
          {get_ticker(order.pair).toUpperCase()}
          <br></br>
          <ColorText red={order.type === 'buy'}>
            {order.type === 'sell' ? 'Sell' : 'Buy'}
          </ColorText>
        </ColorText>
        {/* <ColorText red={order.type === 'buy'}>
          {order.type === 'sell' ? 'Sell' : 'Buy'}&nbsp;
          {get_ticker(order.pair).toUpperCase()}
        </ColorText> */}

        <span>
          {order.rate}
          <br></br>
          <span> x {order.amount}</span>
        </span>
        <span>
          {order.total.toFixed(2)}
          <br></br>
          <span>USDT</span>
        </span>
        <span>{days_ago}</span>
        {order.type === 'sell' ? (
          <span>-</span>
        ) : (
          <ColorText>{margin.toFixed(2)}</ColorText>
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

import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import { get_x_days_ago, get_ticker_balance, get_ticker } from 'utils';
import { AppContext } from 'App';
import Button from 'components/src/button';
import PlaceReverseOrder from './place_reverse_order';
import ColorText from '../gadgets/num';
import { get_mem_store } from 'mem_store';
import { TickerDetailedInfo } from 'tickers/prices';
import ticker from 'tickers/ticker';

interface Props {
  order: FinishedOrderInfo;
  ticker: TickerDetailedInfo;
}

const FinishedOrder = React.memo((prop: Props) => {
  const { order, ticker } = prop;

  const [reverse_show, set_reverse_show] = React.useState(false);

  const margin = ticker.price * Number(order.amount) - order.total;
  const days_ago = get_x_days_ago(order.time_unix * 1000);
  const decimal = ticker.decimal;
  // console.log('render!');
  return (
    <>
      <p>
        <ColorText red={order.type === 'buy'}>
          {get_ticker(order.pair).toUpperCase()}
          <br></br>
          <ColorText red={order.type === 'buy'}>
            {order.type === 'sell' ? 'Sell' : 'Buy'}
          </ColorText>
        </ColorText>

        <span>
          {Number(order.rate).toFixed(decimal)}
          <br></br>
          <span> x {Number(order.amount).toFixed(2)}</span>
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
});

const OrderWrapper = (prop: { order: FinishedOrderInfo }) => {
  const { order } = prop;
  const { balance } = React.useContext(AppContext);
  const token = get_ticker(order.pair).toUpperCase();
  return <FinishedOrder order={order} ticker={balance[token]}></FinishedOrder>;
};

export default OrderWrapper;

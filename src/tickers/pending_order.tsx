import * as React from 'react';
import { PendingOrderInfo, MyHTMLParagraphElement } from 'types';
import Button from 'components/src/button';
import { http_cancel_order } from 'api';
import { AppContext } from 'App';
import { get_ticker, to_percent, get_ticker_balance } from 'utils';
import Toast from 'components/src/Toast';
import ColorText from '../gadgets/num';

interface Props {
  order: PendingOrderInfo;
  scroll?: boolean;
}

const PendingOrder = (prop: Props) => {
  const { order, scroll } = prop;
  const { balance } = React.useContext(AppContext);

  const ref = React.useRef<MyHTMLParagraphElement>();

  const [loading, set_loading] = React.useState(false);

  React.useEffect(() => {
    scroll &&
      ref.current &&
      ref.current.scrollIntoViewIfNeeded &&
      ref.current.scrollIntoViewIfNeeded();
  }, []);

  const cancel_order = async () => {
    set_loading(true);
    http_cancel_order(String(order.id), order.market).then(r => {
      r.message === 'Success' && Toast.show(r.message);
      set_loading(false);
    });
  };

  const bg_classname = order.type === 1 ? 'bg_green' : 'bg_red';
  const current_price = get_ticker_balance(balance, order.market, 'price');

  const diff = Number(order.price) - current_price;

  return (
    <p onClick={e => e.stopPropagation()} className={bg_classname} ref={ref}>
      <span style={{ width: '4%' }}>
        <Button onClick={cancel_order} loading={loading}>
          🗑
        </Button>
      </span>
      <span>{get_ticker(order.market)}</span>

      <ColorText affix={'%'} prefix={diff >= 0 ? '+' : ''}>
        {((diff / current_price) * 100).toFixed(2)}
      </ColorText>
      <span>
        {order.price}
        <br></br>
        <span> x {Number(order.amount).toFixed(2)}</span>
      </span>
      <span>
        {(Number(order.price) * Number(order.amount)).toFixed(2)}
        <br></br>
        <span>USDT</span>
      </span>
      <ColorText red={order.type === 2}>
        {order.type === 1 ? 'Sell' : 'Buy'}
      </ColorText>
    </p>
  );
};

export default React.memo(PendingOrder);

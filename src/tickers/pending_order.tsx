import * as React from 'react';
import { PendingOrderInfo, MyHTMLParagraphElement } from 'types';
import Button from 'components/src/button';
import { http_cancel_order } from 'api';
import { AppContext } from 'App';
import { get_ticker, to_percent } from 'utils';
import Toast from 'components/src/Toast';

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

  const bg_classname = order.type === 1 ? 'bg_red' : 'bg_green';
  const current_price = balance[get_ticker(order.market)].price;
  const diff = Number(order.price) - current_price;

  return (
    <p onClick={e => e.stopPropagation()} className={bg_classname} ref={ref}>
      <span>
        <Button onClick={cancel_order} loading={loading}>
          Cancel
        </Button>
      </span>
      <span className='f-b'>
        {order.price}
        {/* <span>
          
        </span> */}
      </span>
      <span>
        {diff > 0 ? '+' : ''}
        {to_percent(diff / current_price)}
      </span>
      <span>{order.amount}</span>
      <span>{(Number(order.price) * Number(order.amount)).toFixed(2)}</span>
      <span>{order.type === 1 ? 'Sell' : 'Buy'}</span>
    </p>
  );
};

export default PendingOrder;

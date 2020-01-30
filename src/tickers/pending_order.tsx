import * as React from 'react';
import { PendingOrderInfo } from 'types';
import Button from 'components/src/button';
import { http_cancel_order } from 'api';

interface Props {
  order: PendingOrderInfo;
}

const PendingOrder = (prop: Props) => {
  const { order } = prop;
  const [loading, set_loading] = React.useState(false);
  const cancel = async () => {
    set_loading(true);
    http_cancel_order(String(order.id), order.market);
    // const resp = await http_get_balance();
  };
  const bg_classname = order.type === 1 ? 'bg_red' : 'bg_green'
  return (
    <p onClick={e => e.stopPropagation()} className={bg_classname}>
      <span className='f-b'>{order.price}</span>
      <span>{order.amount}</span>
  <span>{(Number(order.price) * Number(order.amount)).toFixed(2)}</span>
      <span>{order.type === 1 ? 'Sell' : 'Buy'}</span>
      <span>
        <Button onClick={cancel} loading={loading}>
          Cancel
        </Button>
      </span>
    </p>
  );
};

export default PendingOrder;

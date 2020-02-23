import * as React from 'react';
import { AppContext } from 'App';
import { filter_valid_tokens, fetch_finished_orders } from 'utils';
import Loading from '../loading';
import FinishedOrder from '../finished_order';

interface Props {}

const should_render = (show: boolean) => {
  const showed = React.useRef(false);
  if (show) {
    showed.current = true;
    return true;
  }
  return showed.current;
};

const FinishedOrders = (prop: Props) => {
  const {
    selected_tab,
    balance,
    finished_orders,
    set_finished_orders
  } = React.useContext(AppContext);

  const is_selected = selected_tab === 'finished';

  const rendered = should_render(is_selected);

  React.useEffect(() => {
    rendered && fetch_finished_orders(balance, set_finished_orders);
  }, [rendered]);

  if (!rendered) return null;

  if (!Object.keys(finished_orders).length) return <Loading></Loading>;

  return (
    <div
      className='table'
      style={{
        display: is_selected ? '' : 'none',
        fontSize: '90%'
      }}
    >
      <p>
        <span>Token</span>
        <span>Price</span>
        <span>Count</span>
        <span>Total</span>
        <span>Type</span>
        <span>Days</span>
        <span>Margin</span>
        {/* <span>Reverse</span> */}
      </p>
      {Object.values(finished_orders)
        .reduce((p, n) => p.concat(n), [])
        .sort((oa, ob) => ob.time_unix - oa.time_unix)
        .map(o => (
          <FinishedOrder
            key={`${o.tradeID}${o.pair}${o.time_unix}`}
            order={o}
          ></FinishedOrder>
        ))}
    </div>
  );
};

export default React.memo(FinishedOrders);

import * as React from 'react';
import { AppContext } from 'App';
import { filter_valid_tokens, fetch_finished_orders } from 'utils';
import Loading from '../loading';
import FinishedOrder from '../finished_order';
import PullRefresh from '../pull_refresh';
import Grouper from './grouper';

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

  const [criteria, set_criteria] = React.useState<'time' | 'token'>('time');

  const fetch = () => fetch_finished_orders(balance, set_finished_orders);

  if (!rendered) return null;

  const list =
    criteria === 'time'
      ? Object.values(finished_orders)
          .reduce((p, n) => p.concat(n), [])
          .sort((oa, ob) => ob.time_unix - oa.time_unix)
      : filter_valid_tokens(balance)
          .map(t => finished_orders[t.ticker].slice(0, 20))
          .reduce((prev, next) => prev.concat(next));

  return (
    <>
      <Grouper on_change={set_criteria}></Grouper>
      <PullRefresh fetch={fetch} fetch_on_init>
        <div
          className='table finished_orders'
          style={{
            display: is_selected ? '' : 'none',
            fontSize: '90%'
          }}
          onTouchStart={e => e.stopPropagation()}
        >
          <p>
            <span>Token</span>
            <span>Price</span>
            <span>Count</span>
            <span>Total</span>
            <span>Type</span>
            <span>Days</span>
            <span>Margin</span>
          </p>
          {list.map(o => (
            <FinishedOrder
              key={`${o.tradeID}${o.pair}${o.time_unix}`}
              order={o}
            ></FinishedOrder>
          ))}
        </div>
      </PullRefresh>
    </>
  );
};

export default React.memo(FinishedOrders);

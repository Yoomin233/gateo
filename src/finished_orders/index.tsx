import * as React from 'react';
import { AppContext } from 'App';
import { filter_valid_tokens, fetch_finished_orders } from 'utils';
import FinishedOrder from './finished_order';
import PullRefresh from '../pull_refresh';
import Grouper from '../gadgets/grouper';
import RenderOnlyWhenNeeded, {
  should_render
} from '../render_only_when_needed';
import { subscribe_ws } from 'api';
import { PendingOrderInfo } from 'types';
import { get_mem_store } from '../mem_store';

interface Props {}

const FinishedOrders = (prop: Props) => {
  const {
    selected_tab,
    balance,
    set_balance,
    finished_orders,
    set_finished_orders
  } = React.useContext(AppContext);

  const is_selected = selected_tab === 'finished';

  const [criteria, set_criteria] = React.useState<string>('Time');

  const fetch = () => {
    // console.log('fetch!');
    set_balance(balance => {
      fetch_finished_orders(balance, set_finished_orders);
      return balance;
    });
    // return
  };

  const rendered =
    should_render(is_selected) || get_mem_store('window_width') > 800;

  // React.useEffect(() => {
  //   if (!rendered) return;
  //   fetch();
  // }, [rendered]);

  React.useEffect(() => {
    if (rendered) {
      if (get_mem_store('init_price_fetched')) {
        fetch();
      } else {
        const timer = setInterval(() => {
          const ready = get_mem_store('init_price_fetched');
          if (ready) {
            console.log('fetch finished orders!!');
            fetch();
            clearInterval(timer);
          }
        }, 100);
        // console.log('not ready!');
      }
    }
  }, [rendered]);

  if (!is_selected && get_mem_store('window_width') < 800) return null;

  const list =
    criteria === 'Time'
      ? Object.values(finished_orders)
          .reduce((p, n) => p.concat(n), [])
          .sort((oa, ob) => ob.time_unix - oa.time_unix)
      : filter_valid_tokens(balance)
          .map(t => finished_orders[t.ticker].slice(0, 20))
          .reduce((prev, next) => prev.concat(next));

  return (
    <div>
      <Grouper<string>
        on_change={set_criteria}
        criterias={['Time', 'Token']}
      ></Grouper>
      <div
        className='table finished_orders'
        onTouchStart={e => e.stopPropagation()}
      >
        <p>
          <span>Token</span>
          <span>Rate</span>
          {/* <span>Count</span> */}
          <span>Total</span>
          {/* <span>Type</span> */}
          <span>Time</span>
          <span>Merit</span>
          <span>Reverse</span>
        </p>
        {list.slice(0, 20).map(o => (
          <FinishedOrder
            key={`${o.tradeID}${o.pair}${o.time_unix}`}
            order={o}
          ></FinishedOrder>
        ))}
      </div>
    </div>
  );
};

export default React.memo(FinishedOrders);

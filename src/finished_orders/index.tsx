import * as React from 'react';
import { AppContext } from 'App';
import {
  filter_valid_tokens,
  fetch_finished_orders,
  EventEmitter
} from 'utils';
import FinishedOrder from './finished_order';
import PullRefresh from '../pull_refresh';
import Grouper from '../gadgets/grouper';
import RenderOnlyWhenNeeded, {
  should_render
} from '../render_only_when_needed';
import { subscribe_ws } from 'api';
import { PendingOrderInfo } from 'types';
import { get_mem_store } from '../utils/mem_store';
import Button from 'components/src/button';

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
  const [show_records_count, set_show_records_count] = React.useState(20);
  const [fetch_progress, set_fetch_progress] = React.useState([0, 0]);

  const fetch = () => {
    set_balance(balance => {
      set_fetch_progress([0, filter_valid_tokens(balance).length]);
      const emitter = fetch_finished_orders(balance, set_finished_orders);
      (emitter as EventEmitter).on((finished, total) => {
        set_fetch_progress([finished, total]);
      });
      return balance;
    });
  };

  const rendered =
    should_render(is_selected) || get_mem_store('window_width') > 800;

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
  const [finished, total] = fetch_progress;

  return (
    <div>
      <Grouper<string>
        on_change={set_criteria}
        criterias={['Time', 'Token']}
      ></Grouper>
      {
        <p
          className='finished_orders_fetch_progress tac pt-1 pb-1'
          style={{
            marginTop: finished !== total ? 0 : '-2em'
          }}
        >
          Fetching... {finished} / {total}
        </p>
      }
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
        {list.slice(0, show_records_count).map(o => (
          <FinishedOrder
            key={`${o.tradeID}${o.pair}${o.time_unix}`}
            order={o}
          ></FinishedOrder>
        ))}
      </div>
      {list.length && show_records_count < list.length ? (
        <p className='tac mb-5 mt-3'>
          <Button onClick={() => set_show_records_count(r => r + 20)}>
            Load More
          </Button>
        </p>
      ) : null}
    </div>
  );
};

export default React.memo(FinishedOrders);

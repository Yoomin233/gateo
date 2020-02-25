import * as React from 'react';
import { AppContext } from 'App';
import { filter_valid_tokens, fetch_finished_orders } from 'utils';
import FinishedOrder from './finished_order';
import PullRefresh from '../pull_refresh';
import Grouper from '../gadgets/grouper';
import RenderOnlyWhenNeeded from '../render_only_when_needed';

interface Props {}

const FinishedOrders = (prop: Props) => {
  const {
    selected_tab,
    balance,
    finished_orders,
    set_finished_orders
  } = React.useContext(AppContext);

  const is_selected = selected_tab === 'finished';

  const [criteria, set_criteria] = React.useState<string>('time');

  const fetch = () => fetch_finished_orders(balance, set_finished_orders);

  const list =
    criteria === 'time'
      ? Object.values(finished_orders)
          .reduce((p, n) => p.concat(n), [])
          .sort((oa, ob) => ob.time_unix - oa.time_unix)
      : filter_valid_tokens(balance)
          .map(t => finished_orders[t.ticker].slice(0, 20))
          .reduce((prev, next) => prev.concat(next));

  return (
    <RenderOnlyWhenNeeded should_render={is_selected}>
      <div
        style={{
          display: is_selected ? '' : 'none'
        }}
      >
        <Grouper<string>
          on_change={set_criteria}
          criterias={['time', 'token']}
        ></Grouper>
        <PullRefresh fetch={fetch} fetch_on_init>
          <div
            className='table finished_orders'
            style={{
              display: is_selected ? '' : 'none'
            }}
            onTouchStart={e => e.stopPropagation()}
          >
            <p>
              <span>Token</span>
              <span>Price</span>
              {/* <span>Count</span> */}
              <span>Total</span>
              {/* <span>Type</span> */}
              <span>Time</span>
              <span>Merit</span>
              <span>Reverse</span>
            </p>
            {list.map(o => (
              <FinishedOrder
                key={`${o.tradeID}${o.pair}${o.time_unix}`}
                order={o}
              ></FinishedOrder>
            ))}
          </div>
        </PullRefresh>
      </div>
    </RenderOnlyWhenNeeded>
  );
};

export default React.memo(FinishedOrders);

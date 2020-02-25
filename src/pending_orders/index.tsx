import * as React from 'react';
import PullRefresh from '../pull_refresh';
import { AppContext } from '../App';
import PendingOrder from '../tickers/pending_order';
import {
  fetch_unexecuted_orders,
  get_ticker,
  get_ticker_balance
} from '../utils';
import RenderOnlyWhenNeeded from '../render_only_when_needed';
import { subscribe_ws } from '../api';
import { PendingOrderInfo } from 'types';
import Grouper from '../gadgets/grouper';

interface Props {}

const PendingOrders = (prop: Props) => {
  const {
    selected_tab,
    balance,
    unexecuted_orders,
    set_unexecuted_orders
  } = React.useContext(AppContext);
  const is_selected = selected_tab === 'executed';

  const [criteria, set_criteria] = React.useState('Time');

  React.useEffect(() => {
    const unsubscriber = subscribe_ws<{
      params: [1 | 2 | 3, PendingOrderInfo];
    }>(data => {
      if (data.method !== 'order.update') return;
      const [, order] = data.params;
      fetch_unexecuted_orders(order.market, set_unexecuted_orders);
    });
    return () => unsubscriber();
  }, []);

  const fetch = () => fetch_unexecuted_orders(balance, set_unexecuted_orders);

  const list = Object.values(unexecuted_orders)
    .reduce((prev, next) => prev.concat(next), [])
    .map(order => {
      const current_price = get_ticker_balance(balance, order.market, 'price');
      order.diff = (Number(order.price) - current_price) / current_price;
      return order;
    })
    .sort((b, a) =>
      criteria === 'Time' ? a.ctime - b.ctime : a.diff - b.diff
    );

  return (
    <RenderOnlyWhenNeeded should_render={is_selected}>
      <div
        style={{
          display: is_selected ? '' : 'none'
        }}
      >
        <Grouper
          on_change={set_criteria}
          criterias={['Time', 'Diff']}
        ></Grouper>
        <PullRefresh fetch={fetch} fetch_on_init>
          <div className='table finished_orders'>
            <p>
              <span>Cancel</span>
              <span>Token</span>
              <span>Diff</span>
              <span>Total</span>
              <span>Type</span>
            </p>
            {list.map(o => (
              <PendingOrder
                key={`${o.ctime}${o.market}`}
                order={o}
              ></PendingOrder>
            ))}
          </div>
        </PullRefresh>
      </div>
    </RenderOnlyWhenNeeded>
  );
};

export default PendingOrders;

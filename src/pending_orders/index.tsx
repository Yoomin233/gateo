import * as React from 'react';
import PullRefresh from '../pull_refresh';
import { AppContext } from '../App';
import PendingOrder from '../tickers/pending_order';
import {
  fetch_unexecuted_orders,
  get_ticker,
  get_ticker_balance
} from '../utils';
import RenderOnlyWhenNeeded, {
  should_render
} from '../render_only_when_needed';
import { subscribe_ws } from '../api';
import { PendingOrderInfo } from 'types';
import Grouper from '../gadgets/grouper';

interface Props {}

let is_positive = true;

const PendingOrders = (prop: Props) => {
  const {
    selected_tab,
    balance,
    unexecuted_orders,
    set_unexecuted_orders
  } = React.useContext(AppContext);
  const is_selected = selected_tab === 'executed';

  const [criteria, set_criteria] = React.useState('Diff');

  const fetch = () => fetch_unexecuted_orders(balance, set_unexecuted_orders);

  const rendered = should_render(is_selected);

  React.useEffect(() => {
    // console.log(rendered);
    if (!rendered) return;

    fetch();

  }, [rendered]);

  if (!is_selected) return null;

  const list = Object.values(unexecuted_orders)
    .reduce((prev, next) => prev.concat(next), [])
    .map(order => {
      const current_price = get_ticker_balance(balance, order.market, 'price');
      order.diff = (Number(order.price) - current_price) / current_price;
      return order;
    })
    .sort((b, a) =>
      criteria === 'Time'
        ? a.ctime - b.ctime
        : Math.abs(b.diff) - Math.abs(a.diff)
    );

  return (
    <div>
      <Grouper on_change={set_criteria} criterias={['Diff', 'Time']}></Grouper>
      <div className='table finished_orders'>
        <p>
          <span>Cancel</span>
          <span>Token</span>
          <span>Diff</span>
          <span>Rate</span>
          <span>Total</span>
          <span>Type</span>
        </p>
        {list.map(o => (
          <PendingOrder
            key={`${o.ctime}${o.market}`}
            order={o}
            // scroll={
            //   o.diff <= 0 && is_positive
            //     ? ((is_positive = false), true)
            //     : false
            // }
          ></PendingOrder>
        ))}
      </div>
    </div>
  );
};

export default PendingOrders;

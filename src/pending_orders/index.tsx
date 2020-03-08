import * as React from 'react';
import PullRefresh from '../pull_refresh';
import { AppContext } from '../App';
import PendingOrder from '../tickers/pending_order';
import {
  fetch_unexecuted_orders,
  get_ticker,
  get_ticker_balance,
  set_price
} from '../utils';
import RenderOnlyWhenNeeded, {
  should_render
} from '../render_only_when_needed';
import { subscribe_ws } from '../api';
import { PendingOrderInfo } from 'types';
import Grouper from '../gadgets/grouper';
import { get_mem_store } from '../mem_store';
import Button from 'components/src/button';

interface Props {}

let is_positive = true;

const PendingOrders = (prop: Props) => {
  const {
    selected_tab,
    balance,
    unexecuted_orders,
    set_unexecuted_orders,
    set_balance
  } = React.useContext(AppContext);
  const is_selected = selected_tab === 'executed';

  const [criteria, set_criteria] = React.useState('Diff');
  const [revealed, set_revealed] = React.useState(20);

  const fetch = () =>
    set_balance(balance => {
      fetch_unexecuted_orders(balance, set_unexecuted_orders);
      return balance;
    });

  const rendered =
    should_render(is_selected) || get_mem_store('window_width') > 800;

  React.useEffect(() => {
    if (rendered) {
      if (get_mem_store('init_price_fetched')) {
        console.log('ready to fetch!');
        fetch();
      } else {
        const timer = setInterval(() => {
          const ready = get_mem_store('init_price_fetched');
          if (ready) {
            console.log('fetch pending orders!...');
            fetch();
            clearInterval(timer);
          }
        }, 100);
        // console.log('not ready!');
      }
    }
  }, [rendered]);

  if (!is_selected && get_mem_store('window_width') < 800) return null;

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
        {list.slice(0, revealed).map(o => (
          <PendingOrder key={`${o.ctime}${o.market}`} order={o}></PendingOrder>
        ))}
      </div>
      {list.length && revealed < list.length ? (
        <p className='tac mb-5 mt-3'>
          <Button onClick={() => set_revealed(r => r + 20)}>Load More</Button>
        </p>
      ) : null}
    </div>
  );
};

export default PendingOrders;

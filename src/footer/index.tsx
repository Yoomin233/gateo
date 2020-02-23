import * as React from 'react';

import './index.less';
import { AppContext } from '../App';
import { fetch_finished_orders } from 'utils';

interface Props {}

const Footer = (prop: Props) => {
  const {
    selected_tab,
    set_selected_tab,
    balance,
    set_finished_orders
  } = React.useContext(AppContext);
  return (
    <div className='tab-footer'>
      <span
        className={selected_tab === 'price' ? 'selected' : ''}
        onClick={() => set_selected_tab('price')}
      >
        <img src={require('../assets/candle-sticks.png')}></img>
        <br />
        Price
      </span>
      <span
        className={selected_tab === 'executed' ? 'selected' : ''}
        onClick={() => set_selected_tab('executed')}
      >
        <img src={require('../assets/trade.png')}></img>
        <br />
        Unexecuted
      </span>
      <span
        className={selected_tab === 'finished' ? 'selected' : ''}
        onClick={() => {
          set_selected_tab('finished');
          if (selected_tab === 'finished') {
            fetch_finished_orders(balance, set_finished_orders);
          }
        }}
      >
        <img src={require('../assets/trade.png')}></img>
        <br />
        Finished
      </span>
    </div>
  );
};

export default Footer;

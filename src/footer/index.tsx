import * as React from 'react';

import './index.less';
import { AppContext } from '../App';
import { fetch_finished_orders, to_percent, get_assets_sum } from 'utils';

interface Props {}

const Footer = (prop: Props) => {
  const {
    selected_tab,
    set_selected_tab,
    balance,
    set_finished_orders,
    ws_status: status
  } = React.useContext(AppContext);

  const [usdt_assets, total_assets] = get_assets_sum(balance);

  React.useEffect(() => {
    document.title = `${total_assets.toFixed(2)} USDT`;
  }, [total_assets]);
  return (
    <div className='tab-footer'>
      <p className='flexSpread'>
        <span className={`ws-indicator ${status || 'online'}`}>
          Status:
          {status.toUpperCase() || 'Online'}
        </span>
        <span>
          (<img src={require('./assets/cryptocurrency.png')}></img>
          {to_percent((total_assets - usdt_assets) / total_assets)})
          <img src={require('./assets/usdt.png')}></img>
          {total_assets.toFixed(2)}
        </span>
      </p>
      <div>
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
          <span>
            <img src={require('../assets/trade.png')}></img>
          </span>
          <br />
          Finished
        </span>
      </div>
    </div>
  );
};

export default Footer;

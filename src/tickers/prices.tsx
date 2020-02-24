import * as React from 'react';
import { Balance, TickerInfo } from 'types';
import Ticker from './ticker';
import { subscribe_ws, query_ticker } from 'api';
import { to_percent, set_balance_info, filter_valid_tokens } from 'utils';
import { AppContext } from 'App';

interface Props {
  tickers: Balance;
}

let sorter_desc = true;

export type TickerDetailedInfo = {
  available: number;
  freeze: number;
  ticker: string;
  price: number;
  usdt_amount: number;
  change: number;
};

const Prices = (prop: Props) => {
  const { tickers } = prop;

  const { balance, set_balance, selected_tab } = React.useContext(AppContext);

  const [sorter, set_sorter] = React.useState(() => (a, b) =>
    b.usdt_amount - a.usdt_amount
  );
  const [collapse_all, set_collapse_all] = React.useState(false);

  const toggle_sorter = (key: string) => {
    set_sorter(() => {
      const multiplyer = sorter_desc ? 1 : -1;
      const res = (a, b) => {
        if (typeof a[key] === 'string') {
          return (a[key].charCodeAt(0) - b[key].charCodeAt(0)) * multiplyer;
        } else {
          return (b[key] - a[key]) * multiplyer;
        }
      };
      sorter_desc = !sorter_desc;

      return res;
    });
  };

  const tickers_arr = filter_valid_tokens(balance, sorter);

  React.useEffect(() => {
    /**
     * 获取最初价格信息
     */
    setTimeout(() => {
      tickers_arr.forEach(ticker => {
        query_ticker(`${ticker.ticker}_USDT`)
          .then(data => {
            set_balance(t => {
              t[ticker.ticker] = set_balance_info(
                t[ticker.ticker],
                data.result
              );
              return { ...t };
            });
          })
          .catch(e => {
            console.log(e);
          });
      });
    }, 300);
  }, []);

  const usdt_assets = tickers['USDT']
    ? tickers['USDT'].available + tickers['USDT'].freeze
    : 0;

  const crypto_assets = tickers_arr.reduce(
    (prev, next) => prev + next.usdt_amount,
    0
  );
  const total_assets = usdt_assets + crypto_assets;

  return (
    <div
      className='table ticker-list'
      style={{
        display: selected_tab === 'price' ? '' : 'none'
      }}
    >
      <p className='flexSpread ticker-header'>
        <span onClick={() => toggle_sorter('ticker')}>Token</span>
        <span onClick={() => toggle_sorter('price')}>
          Price
          <span onClick={() => toggle_sorter('change')}></span>
        </span>
        <span onClick={() => toggle_sorter('usdt_amount')}>USDT</span>
        <span>
          Action&nbsp;
          <span
            onClick={() => set_collapse_all(!collapse_all)}
            className='fs-8'
          >
            Collapse All
          </span>
        </span>
      </p>
      {tickers_arr.map((b, _idx) => (
        <Ticker
          key={b.ticker}
          ticker={balance[b.ticker]}
          collapse_all={collapse_all}
        ></Ticker>
      ))}
      
    </div>
  );
};

export default Prices;

import * as React from 'react';
import { Balance, TickerInfo } from 'types';
import Ticker from './ticker';
import { subscribe_ws, query_ticker } from 'api';
import { to_percent, set_balance_info } from 'utils';
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

const TickerManager = (prop: Props) => {
  const { tickers } = prop;

  const { balance, set_balance } = React.useContext(AppContext);

  const [sorter, set_sorter] = React.useState(() => (a, b) =>
    b.usdt_amount - a.usdt_amount
  );

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

  const tickers_arr = Object.entries(balance)
    .filter(([ticker, info]) => ticker !== 'USDT' && info.price !== 0)
    .map(([ticker, value]) => ({
      ...value,
      ticker
    }))
    .sort(sorter);

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
      // for (let i in balance) {

      // }
    }, 500);

    /**
     * 订阅价格变化
     */
    subscribe_ws<{
      method: string;
      params: [string, TickerInfo];
      id: null;
    }>(data => {
      if (data.method === 'ticker.update') {
        set_balance(tickers => {
          const incoming_name = data.params[0];
          for (let i in tickers) {
            if (`${i}_USDT` !== incoming_name) continue;
            tickers[i] = set_balance_info(tickers[i], data.params[1]);
          }
          return { ...tickers };
        });
      }
    });
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
    <div className='table ticker-list'>
      <p className='flexSpread ticker-header'>
        <span onClick={() => toggle_sorter('ticker')}>Token</span>
        <span onClick={() => toggle_sorter('price')}>
          Price
          <br />
          <span onClick={() => toggle_sorter('change')}>/Change</span>
        </span>
        <span onClick={() => toggle_sorter('usdt_amount')}>=USDT</span>
        <span>Action</span>
      </p>
      {tickers_arr.map((b, _idx) => (
        <Ticker key={b.ticker} ticker={balance[b.ticker]} idx={_idx}></Ticker>
      ))}
      <p className='flexSpread ticker-header'>
        <span>Total Assets</span>
        <span>
          (crypto {to_percent(crypto_assets / total_assets)}, usdt{' '}
          {to_percent(usdt_assets / total_assets)}){total_assets.toFixed(2)}{' '}
          USDT
        </span>
      </p>
    </div>
  );
};

export default TickerManager;

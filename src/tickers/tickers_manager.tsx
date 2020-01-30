import * as React from 'react';
import { Balance, TickerInfo } from 'types';
import Ticker from './ticker';
import {
  subscribe_ws,
  subscribe_tickers,
  subscribe_orders,
  query_ticker
} from 'api';
import { to_percent } from 'utils';
import { AppContext } from 'App';

interface Props {
  tickers: { [key: string]: Balance };
}

let sorter_desc = true;

export type TickerDetailedInfo = Balance & {
  price: number;
  usdt_amount: number;
  change: number;
};

const TickerManager = (prop: Props) => {
  const { tickers } = prop;

  const { balance, set_balance } = React.useContext(AppContext);

  const [sorter, set_sorter] = React.useState(() => (a, b) => 1);

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

  React.useEffect(() => {
    /**
     * 获取最初价格信息
     */
    setTimeout(() => {
      for (let i in balance) {
        query_ticker(`${i}_USDT`)
          .then(data => {
            set_balance(t => {
              const current = t[i];
              t[i] = {
                ...current,
                price: Number(data.result.last),
                usdt_amount:
                  (current.freeze + current.available) *
                  Number(data.result.last),
                change: Number(data.result.change)
              };
              return { ...t };
            });
          })
          .catch(e => {
            console.log(e);
          });
      }
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
            const current = tickers[i];
            tickers[i] = {
              ...current,
              price: Number(data.params[1].last),
              usdt_amount: (current.freeze + current.available) * current.price,
              change: Number(data.params[1].change)
            };
          }
          return { ...tickers };
        });
      }
    });
  }, []);

  const tickers_arr = Object.entries(balance)
    .filter(([t]) => t !== 'USDT')
    .map(([ticker, value]) => ({
      ...value,
      ticker
    }))
    .sort(sorter);

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
        <span onClick={() => toggle_sorter('ticker')}>Pair</span>
        <span>Available</span>
        <span>Freeze</span>
        <span onClick={() => toggle_sorter('price')}>Current Price</span>
        <span onClick={() => toggle_sorter('change')}>24H Change</span>
        <span onClick={() => toggle_sorter('usdt_amount')}>Sum(USDT)</span>
      </p>
      {tickers_arr.map((b, _idx) => (
        <Ticker key={b.ticker} ticker={balance[b.ticker]} idx={_idx}></Ticker>
      ))}
      <p className='flexSpread ticker-header'>
        <span>Total Assets</span>
        <span>
          (crypto {to_percent(crypto_assets / total_assets)}
          %, usdt {to_percent(usdt_assets / total_assets)}%)
          {total_assets.toFixed(2)} USDT
        </span>
      </p>
    </div>
  );
};

export default TickerManager;

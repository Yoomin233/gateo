import crypto from 'crypto';
import { Balance, TickerInfo, FinishedOrderInfo } from 'types';
import { TickerDetailedInfo } from 'tickers/prices';
import { WS_PRICE_UPDATE, http_get_finished_orders } from 'api';
import { set_mem_store } from './mem_store';

export const get_sign = (secret_key: string, message: string) => {
  return crypto
    .createHmac('sha512', secret_key)
    .update(message)
    .digest()
    .toString('base64');
  // h = hmac.new(secret_key, message, hashlib.sha512)
};

export const aggregate_balance = (
  balance: { [key: string]: Balance },
  old_balance: { [key: string]: TickerDetailedInfo }
) => {
  let res: Balance = {};
  for (let i in balance) {
    const current = balance[i];
    const number_freeze = Number(current.freeze);
    const number_available = Number(current.available);
    if (number_freeze + number_available > 0.001) {
      res[i] = {
        freeze: number_freeze,
        available: number_available,
        ticker: i,
        price: old_balance[i] ? old_balance[i].price : 0,
        usdt_amount: old_balance[i] ? old_balance[i].usdt_amount : 0,
        change: old_balance[i] ? old_balance[i].change : 0
      };
    }
  }
  return res;
};

export const aggregate_price = (
  old_balance: Balance,
  price: WS_PRICE_UPDATE
) => {
  const incoming_name = price.params[0];
  for (let i in old_balance) {
    if (`${i}_USDT` !== incoming_name) continue;
    old_balance[i] = set_balance_info(old_balance[i], price.params[1]);
  }
  return { ...old_balance };
};

export const to_percent = (num, frac = 2) =>
  isNaN(num) ? '-' : (num * 100).toFixed(frac) + '%';

export const get_ticker = (str: string) => str.split('_')[0];

export const set_balance_info = (
  ticker: TickerDetailedInfo,
  new_info: TickerInfo
): TickerDetailedInfo => {
  return {
    ...ticker,
    price: Number(new_info.last),
    usdt_amount: (ticker.freeze + ticker.available) * Number(new_info.last),
    change: Number(new_info.change)
  };
};

export const get_ticker_balance = (
  balance: Balance,
  ticker: string,
  key: 'available' | 'freeze' | 'price'
) => {
  return balance[ticker.toUpperCase()]
    ? balance[ticker.toUpperCase()][key] || 0
    : 0;
};

let now = Date.now();
const day_count = 1000 * 3600 * 24;

export const get_x_days_ago = (time: number) => {
  if (now - time < day_count) {
    return `${Math.floor((now - time) / (1000 * 3600))} hrs`;
  }
  return `${Math.floor((now - time) / (1000 * 3600 * 24))} days`;
};

export const create_notification = (
  title: string,
  body: string,
  onclick: () => void
) => {
  if (!window.Notification) return;
  const notification = new Notification(title, {
    body,
    vibrate: [1, 0.5, 1]
  });
  notification.addEventListener('click', onclick);
};

export const get_minmax = <T = number>(
  datas: T[],
  get_attr_func: (arg0: T) => number = arg0 => 0,
  is_min?: boolean
): T => {
  return datas.reduce((prev, next) => {
    let prev_val = get_attr_func(prev);
    let next_val = get_attr_func(next);
    if (is_min) {
      return prev_val < next_val ? prev : next;
    } else {
      return prev_val > next_val ? prev : next;
    }
  });
};

export const ask_notification_permit = () => {
  if (!window.Notification) return;
  Notification.requestPermission().then(res => {
    if (res !== 'denied') {
      set_mem_store('allow_notification', true);
    }
  });
};

export const filter_valid_tokens = (
  balance: Balance,
  sorter = (a, b) => b.usdt_amount - a.usdt_amount
) => {
  return Object.entries(balance)
    .filter(([ticker, info]) => ticker !== 'USDT' && info.price !== 0)
    .map(([ticker, value]) => ({
      ...value,
      ticker
    }))
    .sort(sorter);
};

export const fetch_finished_orders = (
  balance: Balance,
  setter: React.Dispatch<
    React.SetStateAction<{
      [key: string]: FinishedOrderInfo[];
    }>
  >
) => {
  const tokens = filter_valid_tokens(balance).map(t => t.ticker);
  tokens.forEach(async t => {
    const order = await http_get_finished_orders(t);
    setter(o => {
      o[t] = order.trades;
      return { ...o };
    });
  });
};

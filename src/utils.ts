import crypto from 'crypto';
import { Balance, TickerInfo } from 'types';
import { TickerDetailedInfo } from 'tickers/tickers_manager';

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
  return balance[ticker] ? balance[ticker][key] || 0 : 0;
};

let now = Date.now();

export const get_x_days_ago = (time: number) => {
  return Math.floor((now - time) / (1000 * 3600 * 24));
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

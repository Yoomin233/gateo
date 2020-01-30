import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

import crypto from 'crypto';
import { Balance } from 'types';
import { TickerDetailedInfo } from 'tickers/tickers_manager';

export const get_sign = (secret_key: string, message: string) => {
  return crypto
    .createHmac('sha512', secret_key)
    .update(message)
    .digest()
    .toString('base64');
  // h = hmac.new(secret_key, message, hashlib.sha512)
};

export const process_balance = (balance: { [key: string]: Balance }) => {
  let res: { [key: string]: TickerDetailedInfo } = {};
  for (let i in balance) {
    const current = balance[i];
    const number_freeze = Number(current.freeze);
    const number_available = Number(current.available);
    if (number_freeze + number_available > 0.001) {
      res[i] = {
        freeze: number_freeze,
        available: number_available,
        ticker: i,
        price: 0,
        usdt_amount: 0,
        change: 0
      };
    }
  }
  return res;
};

export const to_percent = (num, frac = 2) =>
  isNaN(num) ? '-' : (num * 100).toFixed(frac);

import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

import crypto from 'crypto';
import { Balance } from 'types';

export const get_sign = (secret_key: string, message: string) => {
  return crypto
    .createHmac('sha512', secret_key)
    .update(message)
    .digest()
    .toString('base64');
  // h = hmac.new(secret_key, message, hashlib.sha512)
};

export const process_balance = (balance: { [key: string]: Balance }) => {
  let res = [];
  for (let i in balance) {
    const current = balance[i];
    const number_freeze = Number(current.freeze);
    const number_available = Number(current.available);
    if (number_freeze + number_available > 0.001) {
      res.push({
        freeze: number_freeze,
        available: number_available,
        ticker: i
      });
    }
  }
  return res.sort((a, b) => a.ticker.charCodeAt(0) - b.ticker.charCodeAt(0));
};

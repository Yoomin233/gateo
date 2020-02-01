var querystring = require('querystring');
var crypto = require('crypto');

import Axios from 'axios';

import { Balance, TickerInfo, OrderQueryResp, FinishedOrderInfo } from 'types';
import { get_sign } from 'utils';
import Toast from 'components/src/Toast';
import { set_mem_store, get_mem_store } from '../mem_store';

// export let ws: WebSocket;
const ws_subscribers: ((data: any) => void)[] = [];

export const connect_ws = () => {
  const ws = set_mem_store('ws', new WebSocket('wss://ws.gate.io/v3/'));
  ws.addEventListener('message', e => {
    const data = JSON.parse(e.data);
    ws_subscribers.forEach(cb => cb(data));
  });
  return ws;
};

// export const get_ws_instance = () => ws;

connect_ws();

export const subscribe_ws = <T>(cb: (data: T & { method: string }) => void) => {
  ws_subscribers.push(cb);
  return () => unsubscribe_ws(cb);
};

export const unsubscribe_ws = (cb: (data) => void) => {
  ws_subscribers.splice(ws_subscribers.indexOf(cb), 1);
};

export let user_info_storage = {
  api_key: '',
  secret_key: ''
};

let call_idx = 1000;

const ws_promisify = <T>(
  method: string,
  params: (string | number)[] = []
): Promise<{
  error?: any;
  id: number;
} & T> => {
  // console.log(ws, method);
  return new Promise((res, rej) => {
    const call_sign = call_idx++;
    get_mem_store('ws').send(
      JSON.stringify({
        id: call_sign,
        method: method,
        params
      })
    );
    const listener = data => {
      if (data.id === call_sign) {
        if (data.error) return rej(data);
        unsubscribe_ws(listener);
        return res(data);
      }
    };
    subscribe_ws(listener);
  });
};

export const get_server_time = () =>
  ws_promisify<{ result: number }>('server.time');

export const login = async (api_key: string, secret_key: string) => {
  const { result } = await get_server_time();
  const time = result * 1000;
  const signature = get_sign(secret_key, `${time}`);

  return ws_promisify<{ result: { status: 'success' } }>('server.sign', [
    api_key,
    signature,
    time
  ]);
};

export const get_balance = () =>
  ws_promisify<{ result: { [key: string]: Balance } }>('balance.query');

export const subscribe_balance = cb => {
  ws_promisify('balance.subscribe');
  subscribe_ws(data => {
    if (data.method === 'balance.update') {
      cb(data);
    }
  });
};

export const subscribe_tickers = (ticker: string[]) =>
  ws_promisify<{ result: { status: 'success' } }>('ticker.subscribe', ticker);

export const subscribe_orders = () =>
  ws_promisify<{ result: { status: 'success' } }>('order.subscribe');

export const query_ticker = (ticker: string) =>
  ws_promisify<{ result: TickerInfo }>('ticker.query', [ticker, 86400]);

export const query_orders = (market: string, offset = 0, limit = 50) =>
  ws_promisify<{ result: OrderQueryResp }>('order.query', [
    market,
    offset,
    limit
  ]);

function get_http_sign(str: string, secret: string) {
  let unescapeStr = unescape(str);
  return crypto
    .createHmac('sha512', secret)
    .update(unescapeStr)
    .digest('hex')
    .toString();
}

const is_localhost = location.hostname === 'localhost';

const http_factory = <T>(
  url: string,
  params: { [key: string]: any } = {}
): Promise<HttpResp & T> => {
  if (!is_localhost) {
    Toast.show('http methods is only available when running on localhost!');
    return Promise.reject();
  }
  const data = querystring.stringify(params);
  const SIGN = get_http_sign(data, user_info_storage.secret_key);
  return Axios.post(url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      KEY: user_info_storage.api_key,
      SIGN
    }
  })
    .then(resp => {
      if (resp.data.code !== 0) {
        Toast.show(resp.data.message);
      }
      return resp.data;
    })
    .catch(e => Toast.show(e.message));
};

export const http_cancel_order = (orderNumber: string, currencyPair: string) =>
  http_factory('/api2/1/private/cancelOrder', {
    orderNumber,
    currencyPair
  });

export const http_get_finished_orders = (currencyPair: string) =>
  http_factory<{
    trades: FinishedOrderInfo[];
  }>('/api2/1/private/tradeHistory', {
    currencyPair,
    offset: 0,
    limit: 50
  });

interface HttpResp {
  result: string;
  message: string;
  code: number;
}

export const http_buy = (currencyPair: string, rate: string, amount: string) =>
  http_factory('/api2/1/private/buy', {
    currencyPair,
    rate,
    amount
  });

export const http_sell = (currencyPair: string, rate: string, amount: string) =>
  http_factory('/api2/1/private/sell', {
    currencyPair,
    rate,
    amount
  });

var querystring = require('querystring');
var crypto = require('crypto');

import Axios from 'axios';

import {
  Balance,
  TickerInfo,
  OrderQueryResp,
  FinishedOrderInfo,
  KLineData
} from 'types';
import { get_sign } from 'utils';
import Toast from 'components/src/Toast';
import { set_mem_store, get_mem_store } from '../mem_store';
import {
  fake_balance,
  fake_pending_order,
  fake_finished_order
} from './fake_data';
import { TickerDetailedInfo } from 'tickers/prices';

// export let ws: WebSocket;
const ws_subscribers: ((data: any) => void)[] = [];

const ws_hosts = ['wss://ws.gate.io/v3/', 'wss://ws.gateio.io/v3/'];

export const connect_ws = (reconnect?: boolean) => {
  const set_ws = (
    ws: WebSocket,
    res: (value?: WebSocket) => void,
    timer?: NodeJS.Timeout
  ) =>
    ws.addEventListener('open', () => {
      ws.addEventListener('message', e => {
        const data = JSON.parse(e.data);
        ws_subscribers.forEach(cb => cb(data));
      });
      // ws.addEventListener('close', () => connect_ws(true));
      clearTimeout(timer);
      set_mem_store('ws', ws);
      res(ws);
    });
  return new Promise<WebSocket>((res, rej) => {
    let ws = new WebSocket(ws_hosts[0]);
    let switch_ws_timer = setTimeout(() => {
      ws = new WebSocket(ws_hosts[1]);
      set_ws(ws, res);
    }, 10000);
    set_ws(ws, res, switch_ws_timer);
  });
};

// export const get_ws_instance = () => ws;

// connect_ws();

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

const promisify_datafeed = <T>(data, timeout = 500): Promise<T> =>
  new Promise(res => setTimeout(res, timeout, data));

export const get_balance = () =>
  get_mem_store('is_visitor')
    ? promisify_datafeed<any>(JSON.parse(fake_balance))
    : ws_promisify<{ result: { [key: string]: TickerDetailedInfo } }>(
        'balance.query'
      );

export const subscribe_balance = cb => {
  ws_promisify('balance.subscribe');
  subscribe_ws(data => {
    if (data.method === 'balance.update') {
      cb(data);
    }
  });
};

export type WS_PRICE_UPDATE = {
  method: string;
  params: [string, TickerInfo];
  id: null;
};

export const subscribe_tickers = (
  ticker: string[],
  cb: (data: WS_PRICE_UPDATE) => void
) => {
  ws_promisify<{ result: { status: 'success' } }>('ticker.subscribe', ticker);
  /**
   * 价格变化回调
   */
  cb &&
    subscribe_ws<WS_PRICE_UPDATE>(data => {
      if (data.method === 'ticker.update') {
        cb(data);
      }
    });
};

export const subscribe_orders = () =>
  ws_promisify<{ result: { status: 'success' } }>('order.subscribe');

export const query_ticker = (ticker: string) =>
  ws_promisify<{ result: TickerInfo }>('ticker.query', [ticker, 86400]);

export const query_orders = (market: string, offset = 0, limit = 50) =>
  get_mem_store('is_visitor')
    ? promisify_datafeed<{ result: OrderQueryResp }>(
        JSON.parse(fake_pending_order)
      )
    : ws_promisify<{ result: OrderQueryResp }>('order.query', [
        market,
        offset,
        limit
      ]);

export const query_kline = (
  market: string,
  start: number,
  end: number,
  interval: number
) =>
  ws_promisify<{ result: KLineData[] }>('kline.query', [
    market,
    start,
    end,
    interval
  ]);

function get_http_sign(str: string, secret: string) {
  let unescapeStr = unescape(str);
  return crypto
    .createHmac('sha512', secret)
    .update(unescapeStr)
    .digest('hex')
    .toString();
}

const is_localhost =
  location.hostname === 'localhost' || location.hostname.startsWith('192.168');

const http_factory = <T>(
  url: string,
  params: { [key: string]: any } = {},
  method: 'post' | 'get' = 'post'
): Promise<HttpResp & T> => {
  if (!is_localhost && !get_mem_store('use_http_proxy')) {
    Toast.show(
      'http methods is only available when running on localhost, if http proxy is not used!'
    );
    return Promise.reject();
  }
  const data = querystring.stringify(params);
  const SIGN = get_http_sign(data, user_info_storage.secret_key);
  // console.log(get_mem_store('use_http_proxy'));
  const new_url = get_mem_store('use_http_proxy')
    ? `${'http://www.yoomin.me'}/gate-api${url}`
    : url;
  return Axios[`${method}`](new_url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      KEY: user_info_storage.api_key,
      SIGN
    }
  })
    .then(resp => {
      if (resp.data.code && resp.data.code !== 0) {
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
  get_mem_store('is_visitor')
    ? promisify_datafeed<
        HttpResp & {
          trades: FinishedOrderInfo[];
        }
      >(JSON.parse(fake_finished_order))
    : http_factory<{
        trades: FinishedOrderInfo[];
      }>('/api2/1/private/tradeHistory', {
        currencyPair: `${currencyPair.toUpperCase()}_USDT`,
        offset: 0,
        limit: 50
      });

interface HttpResp {
  result: string;
  message: string;
  code: number;
  data?: any;
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

export const http_query_k_line = (
  token: string,
  group_sec: number,
  range_hour: number
) =>
  http_factory(
    `/api2/1/candlestick2/${token.toLowerCase()}?group_sec=${group_sec}&range_hour=${range_hour}`,
    {
      group_sec,
      range_hour
    },
    'get'
  ).then<KLineData[]>(r => {
    if (r.result !== 'true') return [];
    return r.data.map(line => line.map(l => Number(l)));
  });

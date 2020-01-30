export type User = {
  api_key: string;
  secret_key: string;
};

export type Balance = {
  available: number;
  freeze: number;
  ticker: string;
};

export type TickerInfo = {
  period: 86400;
  open: '0.0521';
  close: '0.0562';
  high: '0.0576';
  low: '0.0517';
  last: '0.0562';
  change: '7.86';
  quoteVolume: '24305935.2623033324';
  baseVolume: '1351826.11556281540896';
};

export type PendingOrderInfo = {
  id: number;
  market: 'EOS_USDT';
  user: number;
  ctime: number;
  mtime: number;
  price: string;
  amount: string;
  left: string;
  dealFee: string;
  orderType: number;
  type: 1 | 2;
  filledAmount: string;
  filledTotal: string;
};

export type FinishedOrderInfo = {
  tradeID: number;
  orderNumber: number;
  pair: string;
  type: string;
  rate: string;
  amount: string;
  total: number;
  date: string;
  time_unix: number;
  role: string;
  fee: string;
  fee_coin: string;
  gt_fee: string;
  point_fee: string;
};

export type OrderQueryResp = {
  limit: number;
  offset: number;
  total: number;
  records: PendingOrderInfo[];
};

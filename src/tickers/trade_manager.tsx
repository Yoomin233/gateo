import * as React from 'react';
import { TickerDetailedInfo } from './prices';
import { AppContext } from 'App';
import { get_ticker_balance } from 'utils';
import Input from 'components/src/input';
import TradePanel from './trade_panel';

interface Props {
  ticker: TickerDetailedInfo;
  expand: boolean;
}

const TradeManager = (prop: Props) => {
  const { ticker, expand } = prop;
  // const [expand, set_expand] = React.useState(false);
  const { balance } = React.useContext(AppContext);
  const usdt_available = get_ticker_balance(balance, 'USDT', 'available');
  const ticker_available = get_ticker_balance(
    balance,
    ticker.ticker,
    'available'
  );
  const ticker_price = get_ticker_balance(balance, ticker.ticker, 'price');
  return (
    <>
      <div
        className='flexSpread place-order-wrapper'
        style={{
          display: expand ? 'flex' : 'none'
        }}
      >
        <TradePanel
          ticker_price={ticker_price}
          ticker={ticker.ticker}
          available={usdt_available}
          buy
        ></TradePanel>
        <TradePanel
          ticker_price={ticker_price}
          ticker={ticker.ticker}
          available={ticker_available}
        ></TradePanel>
      </div>
    </>
  );
};

export default TradeManager;

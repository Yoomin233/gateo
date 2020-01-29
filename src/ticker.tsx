import * as React from 'react';
import { Balance } from 'types';

interface Props {
  ticker: Balance;
}

const Ticker = (prop: Props) => {
  const { ticker } = prop;
  return (
    <div>
      <p>
        <span>Ticker: {ticker.ticker}</span>
        <span>Available: {ticker.available}</span>
        <span>Freeze: {ticker.freeze}</span>
      </p>
    </div>
  );
};

export default Ticker;

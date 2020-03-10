import * as React from 'react';
import Input from 'components/src/input';
import Button from 'components/src/button';
import DialogModal from 'components/src/modal/dialog';
import { http_buy, http_sell } from 'api';
import Toast from 'components/src/Toast';
import { set_mem_store, get_mem_store } from '../utils/mem_store';
import NumberInputPad from './num_input_pad';

interface Props {
  ticker_price: number;
  available: number;
  ticker: string;
  buy?: boolean;
}

const TradePanel = (prop: Props) => {
  const { available, ticker, buy, ticker_price } = prop;

  const is_visitor = get_mem_store('is_visitor');

  const [price, set_price] = React.useState(0);
  const [amount, set_amount] = React.useState(0);

  const [modal, set_modal] = React.useState(false);
  const [input_pad, set_input_pad] = React.useState<boolean>(false);
  const input_pad_setter = React.useRef(null);

  React.useEffect(() => {
    if (ticker_price && !price) set_price(ticker_price);
  }, [ticker_price]);

  const set_num = (ratio: number) => () => {
    if (buy) {
      set_amount(Number(((available / price) * ratio).toFixed(4)));
    } else {
      set_amount(Number((available * ratio).toFixed(4)));
    }
  };

  const place_order = () => {
    if (is_visitor) return Toast.show('not allowed in visitor mode!');
    return (buy ? http_buy : http_sell)(
      `${ticker}_USDT`,
      String(price),
      String(amount)
    ).then(r => {
      if (r.message === 'Success') {
        Toast.show('Success!');
        set_modal(false);
      }
    });
  };

  return (
    <>
      <div>
        <p className='f-b tac mt-1'>
          {buy ? 'Buy' : 'Sell'} {ticker}
        </p>
        <p>
          {buy ? 'USDT' : ticker} Available: {available.toFixed(2)}
        </p>
        <p>
          <Input
            prefixElement={<span>Price: </span>}
            // onChange={e => set_price(Number(e.target.value))}
            value={price}
            wrapperStyle={{
              width: '100%'
            }}
            onFocus={() => {
              input_pad_setter.current = set_price;
              set_input_pad(true);
            }}
            readOnly
          ></Input>
        </p>
        <p>
          <Input
            prefixElement={<span>Amount: </span>}
            onFocus={() => {
              input_pad_setter.current = set_amount;
              set_input_pad(true);
            }}
            readOnly
            value={amount}
          ></Input>
        </p>
        <p className='flexSpread'>
          <span onClick={set_num(0.25)}>25%</span>
          <span onClick={set_num(0.5)}>50%</span>
          <span onClick={set_num(0.75)}>75%</span>
          <span onClick={set_num(1)}>100%</span>
        </p>
        <p>
          {buy ? 'Cost' : 'Income'}: {(price * amount).toFixed(4)} USDT
        </p>
        <p>
          <Button
            className={`${buy ? 'bg_red' : 'bg_green'}`}
            onClick={() => set_modal(true)}
          >
            {buy ? 'Buy' : 'Sell'}
          </Button>
        </p>
      </div>
      <DialogModal
        show={modal}
        dismiss={() => set_modal(false)}
        onOk={place_order}
      >
        <p className='tac f-b'>Confirm</p>
        <p>{buy ? 'Buy' : 'Sell'}</p>
        <p>
          Price: {price}, Current Price: {ticker_price}
        </p>
        <p>Amount: {amount}</p>
        <p>Total: {price * amount}</p>
      </DialogModal>
      <NumberInputPad
        show={input_pad}
        setter={input_pad_setter.current}
        dismiss={() => set_input_pad(false)}
        init_val={input_pad_setter.current === set_price ? price : amount}
      ></NumberInputPad>
    </>
  );
};

export default React.memo(TradePanel);

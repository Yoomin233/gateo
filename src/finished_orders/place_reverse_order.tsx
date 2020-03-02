import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import DialogModal from 'components/src/modal/dialog';
import NumInput from '../gadgets/num_input';
import { get_ticker_balance, get_ticker } from '../utils';
import { AppContext } from '../App';
import { http_buy, http_sell } from '../api';

interface Props {
  order: FinishedOrderInfo;
  show: boolean;
  dismiss: () => void;
}

const PlaceReverseOrder = (prop: Props) => {
  const { show, dismiss, order } = prop;

  const { balance } = React.useContext(AppContext);

  const [section, set_section] = React.useState(1);
  const [step, set_step] = React.useState(10);
  const [portion, set_portion] = React.useState(50);

  const is_buy_more = order.type === 'sell';

  const datas = Array.from({ length: section }).map((_, idx) => {
    const rise_percent = 100 + (idx + 1) * step * (is_buy_more ? -1 : 1);
    return {
      amount: (Number(order.amount) * (portion / 100)) / section,
      rate: Number(order.rate) * (rise_percent / 100),
      rise_percent
    };
  });

  const handle_ok = () => {
    const handler = is_buy_more ? http_buy : http_sell;
    return new Promise(async res => {
      for (let i = 0; i < datas.length; i++) {
        await handler(
          order.pair,
          String(datas[i].rate),
          String(datas[i].amount)
        );
      }
      res();
    });
  };

  return (
    <DialogModal
      show={show}
      dismiss={dismiss}
      onOk={handle_ok}
      destroyOnDismiss
      className='fs-9'
    >
      <p className='tac'>
        Place Reverse Order -{' '}
        <span style={{ color: is_buy_more ? '#f94b4b' : '#4bd04b' }}>
          {is_buy_more ? 'Buy' : 'Sell'}
        </span>
      </p>
      <p className='flexSpread'>
        <span>Order rate: </span>
        <span>
          {order.rate}
          <span className='fs-8'>&nbsp;USDT</span>
        </span>
      </p>
      <p className='flexSpread'>
        <span>Order amount: </span>
        <span>{order.amount}</span>
      </p>
      <p className='flexSpread'>
        <span>Order total: </span>
        <span>
          {order.total}
          <span className='fs-8'>&nbsp;USDT</span>
        </span>
      </p>
      <p className='flexSpread border-bottom pb-1'>
        <span>Current rate: </span>
        <span>
          {get_ticker_balance(balance, order.pair, 'price')}
          <span className='fs-8'>&nbsp;USDT</span>
        </span>
      </p>
      <p className='flexSpread'>
        <span>Portion:</span>
        <NumInput
          step={10}
          on_change={set_portion}
          init_val={portion}
          affix='%'
          desc={((portion / 100) * Number(order.amount)).toFixed(2)}
        ></NumInput>
      </p>
      <p className='flexSpread'>
        <span>Section{section > 1 ? 's' : ''}:</span>
        <NumInput
          step={1}
          on_change={set_section}
          init_val={section}
        ></NumInput>
      </p>
      <p className='flexSpread border-bottom pb-1'>
        <span>Step:</span>
        <NumInput
          step={0.5}
          on_change={set_step}
          init_val={step}
          affix={'%'}
          desc={((step / 100) * Number(order.rate)).toFixed(2)}
        ></NumInput>
      </p>
      {datas.map(d => (
        <p className='flexSpread' key={d.rise_percent}>
          <span>Amount: {d.amount.toFixed(2)}</span>
          <span>
            Price: {d.rate.toFixed(2)}
            <span className='fs-8'>&nbsp;USDT</span>({d.rise_percent}
            %)
          </span>
        </p>
      ))}
      <p className='flexSpread'>
        <span>
          Total:{' '}
          {datas.reduce((prev, next) => prev + next.amount, 0).toFixed(2)}
        </span>
        <span>
          {datas
            .reduce((prev, next) => prev + next.amount * next.rate, 0)
            .toFixed(2)}
          <span className='fs-8'>&nbsp;USDT</span>
        </span>
      </p>
    </DialogModal>
  );
};

export default PlaceReverseOrder;

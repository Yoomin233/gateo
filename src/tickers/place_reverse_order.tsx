import * as React from 'react';
import { FinishedOrderInfo } from 'types';
import DialogModal from 'components/src/modal/dialog';

interface Props {
  order: FinishedOrderInfo;
  show: boolean;
  dismiss: () => void;
}

const PlaceReverseOrder = (prop: Props) => {
  const { show, dismiss, order } = prop;
  const [amounts, set_amounts] = React.useState([
    Number(order.amount) / 2,
    Number(order.amount) / 2
  ]);
  const [levels, set_levels] = React.useState([1.1, 1.2]);
  return (
    <DialogModal show={show} dismiss={dismiss}>
      <p>
        <span>Amount: {amounts[0]}</span>
        <span>
          Level:
          {levels[0]}
        </span>
        <span>
          Price:
          {levels[0] * Number(order.rate)}
        </span>
      </p>
      <p>
        <span>Amount: {amounts[1]}</span>
        <span>
          Level:
          {levels[1]}
        </span>
        <span>
          Price:
          {levels[1] * Number(order.rate)}
        </span>
      </p>
    </DialogModal>
  );
};

export default PlaceReverseOrder;

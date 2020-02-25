import * as React from 'react';

import './index.less'

interface Props {
  init_val?: number;
  step: number;
  on_change: (val: number) => void;
  affix?: React.ReactNode
}

const NumInput = (prop: Props) => {
  const { init_val = 0, step = 1, on_change, affix } = prop;
  const [val, set_val] = React.useState(init_val);
  React.useEffect(() => {
    on_change(val);
  }, [val]);
  return (
    <span className='num-input'>
      <span onClick={() => set_val(v => v + step)}>+</span>
  <span>{val}{affix}</span>
      <span onClick={() => set_val(v => v - step)}>-</span>
    </span>
  );
};

export default NumInput;

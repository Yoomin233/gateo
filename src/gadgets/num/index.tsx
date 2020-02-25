import * as React from 'react';

interface Props {
  num: number;
  prefix?: React.ReactNode;
}

const ColorNum = (prop: Props) => {
  const { num, prefix } = prop;
  return (
    <span
      style={{
        color: num >= 0 ? '#f94b4b' : '#4bd04b'
      }}
    >
      {prefix}
      {num.toFixed(2)}
    </span>
  );
};

export default ColorNum;

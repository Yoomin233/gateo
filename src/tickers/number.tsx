import * as React from 'react';

interface Props {
  num: number;
  children: React.ReactNode;
  pre: React.ReactNode;
}

const Number = (prop: Props) => {
  return (
    <span
      style={{
        color: prop.num >= 0 ? 'lightcoral' : prop.num < 0 ? '#11ec11' : ''
      }}
    >
      {prop.pre}
      {prop.num > 0 ? '+' : ''}
      {prop.num}
      {prop.children}
    </span>
  );
};

export default Number;

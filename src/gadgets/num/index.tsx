import * as React from 'react';

interface Props {
  prefix?: React.ReactNode;
  affix?: React.ReactNode
  children: React.ReactNode;
  red?: boolean;
}

const ColorText = (prop: Props) => {
  const { prefix, red = true, children, affix } = prop;
  let color: string;
  if (!isNaN(Number(children))) {
    color = Number(children) >= 0 ? '#f94b4b' : '#4bd04b';
  } else {
    color = red ? '#f94b4b' : '#4bd04b';
  }
  return (
    <span
      style={{
        color
      }}
    >
      {prefix}
      {children}
      {affix}
    </span>
  );
};

export default ColorText;

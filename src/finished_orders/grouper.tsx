import * as React from 'react';

interface Props {
  on_change: (ariteria: 'time' | 'token') => void;
}

const Grouper = (prop: Props) => {
  const [criteria, set_criteria] = React.useState<'time' | 'token'>('time');
  React.useEffect(() => {
    prop.on_change(criteria);
  }, [criteria]);
  return (
    <p className='orders-grouper'>
      Goup By:
      <span
        className={criteria === 'time' ? 'selected' : ''}
        onClick={() => set_criteria('time')}
      >
        Time
      </span>
      <span
        className={criteria === 'token' ? 'selected' : ''}
        onClick={() => set_criteria('token')}
      >
        Token
      </span>
    </p>
  );
};

export default Grouper;

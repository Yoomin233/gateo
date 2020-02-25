import * as React from 'react';

interface Props<T = string> {
  on_change: (criteria: string) => void;
  criterias: string[];
}

const Grouper: <T>(p: Props<T>) => React.ReactElement<Props<T>> = prop => {
  const { criterias } = prop;
  const [criteria, set_criteria] = React.useState<string>(criterias[0]);
  React.useEffect(() => {
    prop.on_change(criteria);
  }, [criteria]);
  return (
    <p className='orders-grouper'>
      Goup By:
      {criterias.map(c => (
        <span
          key={c}
          className={criteria === c ? 'selected' : ''}
          onClick={() => set_criteria(c)}
        >
          {c}
        </span>
      ))}
    </p>
  );
};

export default Grouper;

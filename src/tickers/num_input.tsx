import * as React from 'react';
import DialogModal from 'components/src/modal/dialog';
import Button from 'components/src/button';
import GenericModal from 'components/src/modal/generic';
import Input from 'components/src/input';

interface Props {
  show: boolean;
  setter: React.Dispatch<React.SetStateAction<number>>;
  dismiss: () => void;
  init_val?: number;
}

const InputPad = (prop: Props) => {
  const { show, setter, dismiss, init_val } = prop;
  const [value, set_value] = React.useState('');
  const input_setter = (val: string) => () =>
    set_value(prev_val => {
      if (val === 'D') return prev_val.slice(0, -1);
      if (val === '.') {
        if (!prev_val) return '';
        if (prev_val.indexOf('.') !== -1) return prev_val;
      }
      if (prev_val === '0') return val;
      return prev_val + val;
    });
  React.useEffect(() => {
    show && init_val !== undefined && set_value(`${init_val}`);
  }, [show]);
  return (
    <DialogModal
      show={show}
      dismiss={dismiss}
      className='num-input-wrapper'
      onOk={() => {
        const res = parseFloat(value);
        setter(isNaN(res) ? 0 : res);
        dismiss();
        // touched.current = false
        setTimeout(() => {
          set_value('');
        }, 500);
      }}
    >
      <Input value={value} readOnly placeholder='Please input'></Input>
      <Button onClick={input_setter('1')}>1</Button>
      <Button onClick={input_setter('2')}>2</Button>
      <Button onClick={input_setter('3')}>3</Button>
      <Button onClick={input_setter('4')}>4</Button>
      <Button onClick={input_setter('5')}>5</Button>
      <Button onClick={input_setter('6')}>6</Button>
      <Button onClick={input_setter('7')}>7</Button>
      <Button onClick={input_setter('8')}>8</Button>
      <Button onClick={input_setter('9')}>9</Button>
      <Button onClick={input_setter('D')}>Del</Button>
      <Button onClick={input_setter('0')}>0</Button>
      <Button onClick={input_setter('.')}>.</Button>
    </DialogModal>
  );
};

export default React.memo(InputPad);

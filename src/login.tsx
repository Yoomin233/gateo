import * as React from 'react';

import DialogModal from 'components/src/modal/dialog';
import Input from 'components/src/input';
import { User } from 'types';
import context from 'context';
import { get_sign } from 'utils';
import { login } from 'api';

import keys from './keys';

// import gate from './gate';

interface Props {
  set_user: (arg0: User) => void;
  show: boolean;
}

const Login = (prop: Props) => {
  const { set_user, show } = prop;
  const [api_key, set_api_key] = React.useState(keys.api_key);
  const [secret_key, set_secret_key] = React.useState(keys.secret_key);

  const [connected, set_connected] = React.useState(false);

  const { ws } = React.useContext(context);

  const log = () => {
    set_user({
      api_key,
      secret_key
    });
    const nonce = Date.now();
    const signature = get_sign(secret_key, `${nonce}`);
    const params = [api_key, signature, nonce];
    login(ws, params);
  };

  React.useEffect(() => {
    ws.addEventListener('open', () => {
      set_connected(true);
      log();
    });
  }, []);

  return (
    <DialogModal
      show={show}
      dismiss={() => {}}
      noCancenBtn
      onOk={log}
      okBtnProps={{
        disabled: !connected
      }}
      okText={connected ? '' : 'Loading...'}
    >
      <p>
        API key:{' '}
        <Input
          value={api_key}
          onChange={e => set_api_key(e.target.value)}
        ></Input>
      </p>
      <p>
        API Secret:{' '}
        <Input
          value={secret_key}
          onChange={e => set_secret_key(e.target.value)}
        ></Input>
      </p>
    </DialogModal>
  );
};

export default Login;

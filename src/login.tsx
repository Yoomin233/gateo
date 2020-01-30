import * as React from 'react';

import DialogModal from 'components/src/modal/dialog';
import Input from 'components/src/input';
import { get_sign } from 'utils';
import {
  login,
  get_server_time,
  user_info_storage,
  subscribe_orders,
  ws
} from 'api';
import { AppContext } from 'App';

const storage_api_key = 'api_key';
const storage_secret_key = 'secret_key';

let time: number;

interface Props {
  finish_login_cb: () => void;
}

const Login = (prop: Props) => {
  const { finish_login_cb } = prop;
  const [api_key, set_api_key] = React.useState(
    localStorage.getItem(storage_api_key) || ''
  );
  const [secret_key, set_secret_key] = React.useState(
    localStorage.getItem(storage_secret_key) || ''
  );

  const [remeber, set_remeber] = React.useState(false);

  const [show, set_show] = React.useState(true);

  const [status, set_status] = React.useState('Connecting...');

  const log = async () => {
    set_status('Logging...');
    const res = await login(api_key, secret_key);
    if (res.result.status === 'success') {
      if (remeber) {
        localStorage.setItem(storage_api_key, api_key);
        localStorage.setItem(storage_secret_key, secret_key);
      }
      user_info_storage.api_key = api_key;
      user_info_storage.secret_key = secret_key;
      finish_login_cb();
      set_show(false);
    }
  };

  React.useEffect(() => {
    ws.addEventListener('open', async () => {
      set_status('');

      if (api_key && secret_key) log();
    });
    ws.addEventListener('close', () => {
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
        disabled: !!status
      }}
      okText={status}
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
      <p>
        <input
          type='checkbox'
          checked={remeber}
          onChange={e => set_remeber(e.target.checked)}
        ></input>
        remember keys
      </p>
    </DialogModal>
  );
};

export default Login;

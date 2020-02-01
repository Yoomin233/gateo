import * as React from 'react';

import DialogModal from 'components/src/modal/dialog';
import Input from 'components/src/input';
import { get_sign } from 'utils';
import {
  login,
  get_server_time,
  user_info_storage,
  subscribe_orders,
  connect_ws
} from 'api';
import { set_mem_store, get_mem_store } from './mem_store';

const storage_api_key = 'api_key';
const storage_secret_key = 'secret_key';

interface Props {
  finish_login_cb: (visitor?: boolean) => void;
}

const Login = (prop: Props) => {
  const { finish_login_cb } = prop;

  // const { set_is_visitor } = React.useContext(AppContext);

  const [api_key, set_api_key] = React.useState(
    localStorage.getItem(storage_api_key) || ''
  );
  const [secret_key, set_secret_key] = React.useState(
    localStorage.getItem(storage_secret_key) || ''
  );

  const [remeber, set_remeber] = React.useState(true);

  const [show, set_show] = React.useState(true);

  const [status, set_status] = React.useState('Connecting...');

  const log = async () => {
    set_status('Logging...');
    const res = await login(api_key, secret_key);
    if (res.result.status === 'success') {
      if (remeber) {
        localStorage.setItem(storage_api_key, api_key);
        localStorage.setItem(storage_secret_key, secret_key);
      } else {
        localStorage.removeItem(storage_api_key);
        localStorage.removeItem(storage_secret_key);
      }
      user_info_storage.api_key = api_key;
      user_info_storage.secret_key = secret_key;
      finish_login_cb();
      set_show(false);
      set_status('');
    }
  };

  React.useEffect(() => {
    get_mem_store('ws').addEventListener('open', async () => {
      set_status('');

      // if (api_key && secret_key) log();
    });
    get_mem_store('ws').addEventListener('close', function() {
      console.log('ws disconnect!');
      set_status('Disconnected');
      connect_ws().addEventListener('open', log);
    });
  }, []);

  return (
    <>
      <div className='ws-indicator'>
        <span onClick={connect_ws}>Status: {status || 'online'}</span>
      </div>
      <DialogModal
        show={show}
        dismiss={() => {}}
        onOk={log}
        okBtnProps={{
          disabled: !!status
        }}
        cancelBtnProps={{
          disabled: !!status
        }}
        okText={status || '登录'}
        cancelText={'游客登录'}
        onCancel={() => {
          set_mem_store('is_visitor', true);
          // set_is_visitor(true);
          set_show(false);
          finish_login_cb(true);
        }}
      >
        <p className='f-b tac'>Login</p>
        <p>
          API key:{' '}
          <Input
            type='password'
            value={api_key}
            onChange={e => set_api_key(e.target.value)}
          ></Input>
        </p>
        <p>
          API Secret:{' '}
          <Input
            type='password'
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
    </>
  );
};

export default Login;

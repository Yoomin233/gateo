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
import Tip from 'components/src/tip';

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
  const [is_visitor, set_is_visitor] = React.useState(false);
  const [use_http_proxy, set_use_http_proxy] = React.useState(false);

  const [show, set_show] = React.useState(true);

  const [status, set_status] = React.useState('Connecting...');

  const log = async () => {
    if (is_visitor) {
      set_mem_store('is_visitor', true);
      set_show(false);
      finish_login_cb(true);
      return;
    }
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
      set_mem_store('logged_in', true);
    }
  };

  React.useEffect(() => {
    get_mem_store('ws').addEventListener('open', async () => {
      set_status('');
    });
    get_mem_store('ws').addEventListener('close', function() {
      console.log('ws disconnect!');
      set_status('Websocket Disconnected');
      setTimeout(() => {
        console.log('reconnect');
        connect_ws().addEventListener('open', () => {
          set_status('');
          get_mem_store('logged_in') && log();
        });
      }, 5000);
    });
  }, []);

  const btn_disabled = !!status || is_visitor ? false : !api_key || !secret_key;

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
          disabled: btn_disabled
        }}
        okText={status || `${is_visitor ? '游客' : ''}登录`}
        className='login-modal'
        noCancenBtn
      >
        <p className='f-b tac'>Login</p>
        <p className='flexSpread'>
          API key:{' '}
          <Input
            disabled={is_visitor}
            type='password'
            value={api_key}
            onChange={e => set_api_key(e.target.value)}
          ></Input>
        </p>
        <p className='flexSpread'>
          API Secret:{' '}
          <Input
            disabled={is_visitor}
            type='password'
            value={secret_key}
            onChange={e => set_secret_key(e.target.value)}
          ></Input>
        </p>
        <p>
          <input
            id='remeber'
            type='checkbox'
            checked={remeber}
            onChange={e => set_remeber(e.target.checked)}
            disabled={is_visitor}
          ></input>
          <label htmlFor='remeber'>
            Remember Your Keys
            <Tip trigger='hover'>
              If checked, your api key and api secret will be stored locally for
              next login
            </Tip>
          </label>
        </p>
        {!is_visitor && (
          <p>
            <input
              id='use_http_proxy'
              type='checkbox'
              checked={use_http_proxy}
              onChange={e => set_use_http_proxy(e.target.checked)}
              // disabled={is_visitor}
            ></input>
            <label htmlFor='use_http_proxy'>
              Use Http Proxy
              <Tip trigger='hover'>
                When checked, http requests will be send to a proxy server to
                circumvent the CORS issue. If you are concerned about this,
                please do not check, but http-requests will be unavailable.
              </Tip>
            </label>
          </p>
        )}
        <p>
          <input
            id='is_visitor'
            type='checkbox'
            checked={is_visitor}
            onChange={e => set_is_visitor(e.target.checked)}
          ></input>
          <label htmlFor='is_visitor'>
            I am a visitor
            <Tip trigger='hover'>Just look around!👀</Tip>
          </label>
        </p>
      </DialogModal>
    </>
  );
};

export default Login;

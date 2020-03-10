import * as React from 'react';

import DialogModal from 'components/src/modal/dialog';
import Input from 'components/src/input';
import { login, user_info_storage, connect_ws } from 'api';
import { set_mem_store, get_mem_store } from './utils/mem_store';
import Tip from 'components/src/tip';
import { AppContext } from 'App';
import { local_storage } from './utils';

const storage_api_key = 'api_key';
const storage_secret_key = 'secret_key';

interface Props {
  finish_login_cb: (visitor?: boolean) => void;
}

const Login = (prop: Props) => {
  const { finish_login_cb } = prop;

  const { ws_status, set_ws_status } = React.useContext(AppContext);
  const [api_key, set_api_key] = React.useState(
    local_storage.get(storage_api_key) || ''
  );
  const [secret_key, set_secret_key] = React.useState(
    local_storage.get(storage_secret_key) || ''
  );

  const [remeber, set_remeber] = React.useState(true);
  const [is_visitor, set_is_visitor] = React.useState(false);
  const [use_http_proxy, set_use_http_proxy] = React.useState(true);

  const [show, set_show] = React.useState(true);

  const log = async () => {
    set_mem_store('use_http_proxy', use_http_proxy);
    if (is_visitor) {
      set_mem_store('is_visitor', true);
      set_show(false);
      finish_login_cb(true);
      return;
    }

    set_ws_status('logging');
    const res = await login(api_key, secret_key);
    if (res.result.status === 'success') {
      if (remeber) {
        local_storage.set(storage_api_key, api_key);
        local_storage.set(storage_secret_key, secret_key);
      } else {
        local_storage.remove(storage_api_key);
        local_storage.remove(storage_secret_key);
      }
      user_info_storage.api_key = api_key;
      user_info_storage.secret_key = secret_key;
      finish_login_cb();
      set_show(false);
      set_ws_status('');
      set_mem_store('logged_in', true);
    }
  };

  const connect = () => {
    set_ws_status('connecting');
    connect_ws().then(ws => {
      ws.addEventListener('close', function() {
        console.log('ws disconnect!');
        set_ws_status('disconnected');
        setTimeout(() => {
          console.log('reconnect');
          connect();
        }, 500);
      });
      get_mem_store('logged_in') && log();
      set_ws_status('');
    });
  };

  React.useEffect(() => {
    connect();
    set_mem_store('window_width', window.innerWidth)
  }, []);

  const btn_disabled = !!ws_status;

  // console.log(btn_disabled);

  return (
    <>
      {/* <div className='ws-indicator'>
        Status:
        <span onClick={connect} className={status || 'online'}>
          {status.toUpperCase() || 'Online'}
        </span>
      </div> */}
      <DialogModal
        show={show}
        dismiss={() => {}}
        onOk={log}
        okBtnProps={{
          disabled: btn_disabled
        }}
        okText={ws_status || `${is_visitor ? '游客' : ''}登录`}
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
              When checked, http requests will be send to a proxy
              server(www.yoomin.me) to circumvent the CORS limitation imposed by
              gate.io server. If you are concerned about sending credentials to
              my server, please do not check, but http-related requests will be
              unavailable.
            </Tip>
          </label>
        </p>
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

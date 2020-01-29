import * as React from 'react';
import Login from './login';
import { User, Balance } from 'types';
import context from 'context';
import { API_CODES, get_balance } from 'api';
import { process_balance } from 'utils';
import Ticker from './ticker';
import UBLogo from 'components/src/ub-logo';

const ws = new WebSocket('wss://ws.gate.io/v3/');

export default () => {
  const [user, set_user] = React.useState<User>({
    api_key: '',
    secret_key: ''
  });

  const [balance, set_balance] = React.useState<Balance[]>([]);

  const [fetching, set_fetching] = React.useState(true);

  React.useEffect(() => {
    ws.addEventListener('message', e => {
      const data = JSON.parse(e.data);
      if (data.id === API_CODES['server.sign']) {
        get_balance(ws);
      }
      if (data.id === API_CODES['balance.query']) {
        set_balance(process_balance(data.result));
        set_fetching(false);
      }
    });
  }, []);

  return (
    <context.Provider
      value={{
        ws
      }}
    >
      {fetching ? <UBLogo size={50}></UBLogo> : null}
      {balance.map(b => (
        <Ticker ticker={b}></Ticker>
      ))}
      <Login show={!user.api_key} set_user={set_user}></Login>
    </context.Provider>
  );
};

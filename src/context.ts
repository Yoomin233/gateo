import * as React from 'react';

export default React.createContext<{
  ws: WebSocket;
}>({
  ws: void 0
});

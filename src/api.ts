export enum API_CODES {
  'server.sign' = 1001,
  'balance.query' = 1002
}

export const login = (ws: WebSocket, params: any[]) => {
  ws.send(
    JSON.stringify({
      id: API_CODES["server.sign"],
      method: 'server.sign',
      params: params
    })
  );
};

export const get_balance = (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      id: API_CODES["balance.query"],
      method: 'balance.query',
      params: []
    })
  );
};

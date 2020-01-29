export type User = {
  api_key: string;
  secret_key: string;
};


export type Balance = {
  available: number,
  freeze: number,
  ticker: string
}
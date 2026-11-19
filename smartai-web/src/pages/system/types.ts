export interface LogItem {
  id: string;
  username: string;
  status: 'success' | 'fail';
  description: string;
  url: string;
  costTime: number;
  method: string;
  ip: string;
  operateTime: string;
}

export interface TokenItem {
  id: string;
  token: string;
  account: string;
  expireTime: string;
}

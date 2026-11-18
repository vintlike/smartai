export interface LogItem {
  id: number;
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
  id: number;
  token: string;
  account: string;
  expireTime: string;
}

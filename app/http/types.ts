export type HttpVersion = "HTTP/1.1";
export type HttpMethod = 'GET' | 'POST';
export const HttpStatusMessages = {
  200: 'OK',
  201: 'Created',
  404: 'Not Found',
  500: 'Internal Server Error',
  501: 'Not Implemented',
} as const;
export type HttpStatusCode = keyof typeof HttpStatusMessages;
export type HttpStatusMessage = (typeof HttpStatusMessages)[HttpStatusCode];
const HttpResponseHeaders = {
  "Content-Type": ['application/octet-stream', 'text/plain'],
  "Content-Length": [] as string[],
  "Content-Encoding": ['gzip'],
} as const;
export type CompressionType = typeof HttpResponseHeaders['Content-Encoding'][number];
export type HttpResponseHeaderName = keyof typeof HttpResponseHeaders;
export type HttpResponseHeaderValueMap = {
  [K in HttpResponseHeaderName]: K extends 'Content-Length'
  ? string
  : (typeof HttpResponseHeaders)[K][number];
};
export interface Request {
  method: string;
  target: string;
  version: string;
  headers: Map<string, string>;
  body: string;
};
export type ParamObject<S extends String> =
  S extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ParamObject<`/${Rest}`>]: string }
  : S extends `${infer Start}:${infer Param}`
  ? { [K in Param]: string }
  : {};

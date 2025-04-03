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
  "content-type": ['application/octet-stream', 'text/plain'],
  "content-length": [] as string[],
  "content-encoding": ['gzip'],
} as const;
export type HttpResponseHeaderName = keyof typeof HttpResponseHeaders;
export type HttpResponseHeaderValueMap = {
  [K in HttpResponseHeaderName]: K extends 'content-length'
  ? string
  : (typeof HttpResponseHeaders)[K][number];
};

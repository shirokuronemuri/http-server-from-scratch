import type { HttpMethod } from "./types";
interface Request {
  // todo: send 501 Not Supported if method is not in HttpMethod
  method: string;
  target: string;
  version: string;
  headers: Map<string, string>;
  body: string;
};

export class HttpRequest {
  #request: Request;

  get method() {
    return this.#request.method;
  }
  get target() {
    return this.#request.target;
  }
  get version() {
    return this.#request.version;
  }
  header(header: string) {
    return this.#request.headers.get(header);
  }
  get body() {
    return this.#request.body;
  }

  constructor(requestBuffer: Buffer) {
    this.#request = parseRequest(requestBuffer);
  }

}

const parseRequest = (requestBuffer: Buffer): Request => {
  const requestData = requestBuffer.toString().split('\r\n');
  const [method, target, version] = requestData[0].split(' ');
  const body = requestData[requestData.length - 1];
  const headers = new Map<string, string>(requestData.slice(1, -2).map((header) => {
    const [key, value] = header.split(': ');
    return [key, value];
  }));

  return {
    method,
    target,
    version,
    headers,
    body
  };
};

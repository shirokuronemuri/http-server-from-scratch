import type { HttpMethod } from "./types";
interface Request {
  method: string;
  target: string;
  params: { [key: string]: string; };
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

  parseParams(target: string) {
    const paramKeys = [...target.matchAll(/:(\w+)/g)].map((match) => match[1]);

    const targetPattern = new RegExp(target.replace(/:(\w+)/g, "([^/]+)"));
    const targetValueMatch = this.#request.target.match(targetPattern);
    if (targetValueMatch) {
      this.#request.params = Object.fromEntries(paramKeys.map((key, i) => [key, targetValueMatch[i + 1]]));
    }

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
    params: {},
    headers,
    body
  };
};

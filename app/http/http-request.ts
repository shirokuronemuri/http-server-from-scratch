import type { HttpMethod, ParamObject, Request } from "./types";


export class HttpRequest<ParamType> {
  #request: Request;
  #params: ParamType;

  constructor(request: Request, params: ParamType) {
    this.#request = request;
    this.#params = params;
  }

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
  get param() {
    return { ...this.#params };
  }

  static parseParams<Path extends string>(requestTarget: string, endpointTarget: Path): ParamObject<Path> {
    const paramKeys = [...endpointTarget.matchAll(/:(\w+)/g)].map((match) => match[1]);

    const targetPattern = new RegExp(`^${endpointTarget.replace(/:(\w+)/g, "([^/]+)")}$`);
    const targetValueMatch = requestTarget.match(targetPattern);
    if (targetValueMatch) {
      return Object.fromEntries(paramKeys.map((key, i) => [key, targetValueMatch[i + 1]])) as ParamObject<Path>;
    }
    else {
      return {} as ParamObject<Path>;
    }
  }

  static parseRequest(requestBuffer: Buffer): Request {
    const requestData = requestBuffer.toString().split('\r\n');
    const [method, target, version] = requestData[0].split(' ');
    const body = requestData[requestData.length - 1];
    const headers = new Map<string, string>(requestData.slice(1, -2).map((header) => {
      const [key, value] = header.split(': ');
      return [key.toLowerCase(), value];
    }));

    return {
      method,
      target,
      version,
      headers,
      body
    };
  };

}

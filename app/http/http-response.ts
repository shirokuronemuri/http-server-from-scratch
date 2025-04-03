import * as net from "node:net";
import type { HttpResponseHeaderName, HttpResponseHeaderValueMap, HttpStatusCode, HttpVersion } from "./types";

// type HttpHeaders = Map<
//   HttpResponseHeaderName,
//   HttpResponseHeaderValueMap[HttpResponseHeaderName & keyof HttpResponseHeaderValueMap]>;

class HttpHeaders {
  #headers: { [key: string]: string; } = {};

  set<K extends keyof HttpResponseHeaderValueMap>(key: K, value: HttpResponseHeaderValueMap[K]): void {
    this.#headers[key] = value;
  };

  get<K extends keyof HttpResponseHeaderValueMap>(key: K): HttpResponseHeaderValueMap[K] | undefined {
    return this.#headers[key] as HttpResponseHeaderValueMap[K] | undefined;
  }
}

type Response = {
  version: HttpVersion,
  statusCode: HttpStatusCode;
  headers: HttpHeaders;
  body?: string | Buffer;
};

export class HttpResponse {
  #socket: net.Socket;
  #response: Response;

  constructor(socket: net.Socket) {
    this.#socket = socket;
    this.#response = {
      version: "HTTP/1.1",
      statusCode: 200,
      headers: new HttpHeaders()
    };
  }

  version(version: HttpVersion): this {
    this.#response.version = version;
    return this;
  }

  status(statusCode: HttpStatusCode): this {
    this.#response.statusCode = statusCode;
    return this;
  }

  header<K extends keyof HttpResponseHeaderValueMap>(key: K, value: HttpResponseHeaderValueMap[K]): this {
    this.#response.headers.set(key, value);
    return this;
  }

  body(body: string | Buffer): this {
    this.#response.body = body;
    return this;
  }
}

import * as net from "node:net";
import { HttpStatusMessages, type HttpResponseHeaderName, type HttpResponseHeaderValueMap, type HttpStatusCode, type HttpVersion } from "./types";

class HttpHeaders {
  #headers: { [key: string]: string; } = {};

  set<K extends keyof HttpResponseHeaderValueMap>(key: K, value: HttpResponseHeaderValueMap[K]): void {
    this.#headers[key] = value;
  };

  get<K extends keyof HttpResponseHeaderValueMap>(key: K): HttpResponseHeaderValueMap[K] | undefined {
    return this.#headers[key] as HttpResponseHeaderValueMap[K] | undefined;
  }

  getAll(): { [key: string]: string | undefined; } {
    return { ...this.#headers };
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

  send() {
    let headers = this.#response.headers.getAll();
    let headerString = "";
    for (let key in headers) {
      headerString += `${key}: ${headers[key]}\r\n`;
    }
    this.#socket.write([
      `${this.#response.version} ${this.#response.statusCode} ${HttpStatusMessages[this.#response.statusCode]}`,
      headerString,
      ""
    ].join('\r\n'));
    if (this.#response.body) {
      this.#socket.write(this.#response.body);
    }
    this.#socket.end();
  }
}

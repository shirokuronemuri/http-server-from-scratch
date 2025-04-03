import * as net from "net";
import type { HttpMethod } from "./types";

export class HttpServer {
  #port: number;
  #hostname: string;
  #endpoints: {
    method: HttpMethod;
    target: string | RegExp;
  }[] = [];

  constructor(hostname: string = 'localhost', port: number = 4221) {
    this.#port = port;
    this.#hostname = hostname;
  }

  start() {
    const server = net.createServer((socket) => {
      socket.on("data", (requestBuffer) => {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
      });

      socket.on("close", () => {
        socket.end();
      });
    });
    server.listen(this.#port, this.#hostname);
  }
}

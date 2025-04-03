import * as net from "net";
import type { HttpMethod } from "./types";
import { HttpRequest } from "./http-request";
import { HttpResponse } from "./http-response";

export class HttpServer {
  #port: number;
  #hostname: string;
  #endpoints: {
    method: HttpMethod;
    target: string;
    callback: (req: HttpRequest, res: HttpResponse) => void;
  }[] = [];

  constructor(hostname: string = 'localhost', port: number = 4221) {
    this.#port = port;
    this.#hostname = hostname;
  }

  start() {
    const server = net.createServer((socket) => {
      socket.on("data", (requestBuffer) => {
        const req = new HttpRequest(requestBuffer);
        const res = new HttpResponse(socket);

        let endpointMatched = false;
        for (let endpoint of this.#endpoints) {
          if (req.method === endpoint.method && req.target === endpoint.target) {
            endpointMatched = true;
            endpoint.callback.call(this, req, res);
            res.send();
            break;
          }
        }
        if (!endpointMatched) {
          res.status(404).send();
        }
      });

      socket.on("close", () => {
        socket.end();
      });
    });
    server.listen(this.#port, this.#hostname);
  }

  get(target: string, callback: (req: HttpRequest, res: HttpResponse) => void) {
    this.#endpoints.push({ method: 'GET', target, callback });
  }

  post(target: string, callback: (req: HttpRequest, res: HttpResponse) => void) {
    this.#endpoints.push({ method: 'POST', target, callback });
  }
}

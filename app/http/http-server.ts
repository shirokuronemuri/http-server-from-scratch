import * as net from "net";
import type { HttpMethod, ParamObject } from "./types";
import { HttpRequest } from "./http-request";
import { HttpResponse } from "./http-response";

type Endpoint<Path extends string = string> = {
  method: HttpMethod;
  target: Path;
  callback: (req: HttpRequest<ParamObject<Path>>, res: HttpResponse) => void | Promise<void>;
};

export class HttpServer {
  #port: number;
  #hostname: string;
  #endpoints: Endpoint[] = [];

  constructor(hostname: string = 'localhost', port: number = 4221) {
    this.#port = port;
    this.#hostname = hostname;
  }

  start() {
    const server = net.createServer((socket) => {
      socket.on("data", async (requestBuffer) => {
        const parsedReq = HttpRequest.parseRequest(requestBuffer);
        const res = new HttpResponse(socket);
        let endpointMatched = false;
        for (let endpoint of this.#endpoints) {
          if (parsedReq.method === endpoint.method && isTargetMatch(parsedReq.target, endpoint.target)) {
            endpointMatched = true;
            const parsedParams = HttpRequest.parseParams(parsedReq.target, endpoint.target);
            const req = new HttpRequest(parsedReq, parsedParams);
            await endpoint.callback.call(this, req, res);
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

  get<Path extends string>(target: Path, callback: (req: HttpRequest<ParamObject<Path>>, res: HttpResponse) => void) {
    const endpoint: Endpoint<Path> = {
      method: 'GET',
      target,
      callback
    };
    this.#endpoints.push(endpoint);
  }

  post<Path extends string>(target: Path, callback: (req: HttpRequest<ParamObject<Path>>, res: HttpResponse) => void) {
    const endpoint: Endpoint<Path> = {
      method: 'POST',
      target,
      callback
    };
    this.#endpoints.push(endpoint);
  }
}

function isTargetMatch(requestTarget: string, endpointTarget: string) {
  const targetPattern = new RegExp(`^${endpointTarget.replace(/:(\w+)/g, "([^/]+)")}$`);
  return requestTarget.match(targetPattern);
}

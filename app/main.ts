import * as net from "node:net";
import fs from "node:fs";
import path from "node:path";

type Request = {
  method: string;
  target: string;
  version: string;
  headers: Map<string, string>;
  body: string;
};

const contentLength = (text: string): number => new Blob([text]).size;

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
  // todo create an easy way to make new endpoints
  // todo watch typescript enums are terrible by michigan typescript
  // todo add parameter parsing
};

const getRequestHandlers = new Map<string | RegExp, (socket: net.Socket, req: Request) => void>([
  ['/', (socket) => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  }],
  [/^\/echo\/.+$/, (socket, req) => {
    const echoedString = req.target.split('/')[2];
    socket.write([
      "HTTP/1.1 200 OK",
      "Content-Type: text/plain",
      `Content-Length: ${contentLength(echoedString)}`,
      "",
      echoedString
    ].join('\r\n'));
  }],
  ['/user-agent', (socket, req) => {
    socket.write([
      "HTTP/1.1 200 OK",
      "Content-Type: text/plain",
      `Content-Length: ${contentLength(req.headers.get("User-Agent") ?? "")}`,
      '',
      req.headers.get("User-Agent")
    ].join("\r\n"));
  }],
  [/^\/files\/.+$/, (socket, req) => {
    const directory = process.argv[3];
    const fileName = req.target.split('/')[2];
    const filePath = path.join(directory, fileName);
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
      socket.write([
        "HTTP/1.1 200 OK",
        "Content-Type: application/octet-stream",
        `Content-Length: ${contentLength(fileContents)}`,
        '',
        fileContents
      ].join('\r\n'));
    }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  }]
]);


const server = net.createServer((socket) => {
  socket.on("data", (requestBuffer) => {
    const req = parseRequest(requestBuffer);
    let noHandlerFound = true;
    if (req.method === 'GET') {
      for (const [target, handler] of getRequestHandlers) {
        if (typeof target === 'string' && req.target === target) {
          noHandlerFound = false;
          handler(socket, req);
          break;
        }
        else if (target instanceof RegExp && target.test(req.target)) {
          noHandlerFound = false;
          handler(socket, req);
          break;
        }
      }
      if (noHandlerFound) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");

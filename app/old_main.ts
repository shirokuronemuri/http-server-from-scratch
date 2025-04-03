import * as net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

type Request = {
  method: string;
  target: string;
  version: string;
  headers: Map<string, string>;
  body: string;
};

const contentLength = (content: string | Buffer): number => new Blob([content]).size;

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
  // todo add error handling for incorrect requests
  // todo add header checks
  // todo add cookie support
  // todo create httpserver class; request and response class; 
  // todo abstract away the server logic with server.get & .post methods, send responses with chained res calls 
};

const requestHandlers = new Map<string, Map<string | RegExp, (socket: net.Socket, req: Request) => void>>();

requestHandlers.set('GET', new Map<string | RegExp, (socket: net.Socket, req: Request) => void>([
  ['/', (socket) => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  }],
  [/^\/echo\/.+$/, (socket, req) => {
    const echoedString = req.target.split('/')[2];
    const encodingHeader = req.headers.get('Accept-Encoding');
    const usesGzip = encodingHeader && encodingHeader.includes('gzip');
    const responseBody = usesGzip ? gzipSync(echoedString) : echoedString;
    socket.write([
      "HTTP/1.1 200 OK",
      ...(usesGzip ? ['Content-Encoding: gzip'] : []),
      "Content-Type: text/plain",
      `Content-Length: ${contentLength(responseBody)}`,
      "",
      ""
    ].join('\r\n'));
    socket.write(responseBody);
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
]));

requestHandlers.set('POST', new Map<string | RegExp, (socket: net.Socket, req: Request) => void>([
  [/^\/files\/.+$/, (socket, req) => {
    const directory = process.argv[3];
    const fileName = req.target.split('/')[2];
    const filePath = path.join(directory, fileName);
    try {
      fs.writeFileSync(filePath, req.body);
    } catch (err) {
      console.error(err);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      // socket.end();
    }
    socket.write("HTTP/1.1 201 Created\r\n\r\n");
  }]
]));

const server = net.createServer((socket) => {
  socket.on("data", (requestBuffer) => {
    const req = parseRequest(requestBuffer);
    let handlerFound = false;
    const handlers = requestHandlers.get(req.method);
    if (!handlers) {
      socket.write("HTTP/1.1 501 Not Implemented\r\n\r\n");
    }
    else {
      for (const [target, handler] of handlers) {
        if (typeof target === 'string' && req.target === target) {
          handlerFound = true;
          handler(socket, req);
          break;
        }
        else if (target instanceof RegExp && target.test(req.target)) {
          handlerFound = true;
          handler(socket, req);
          break;
        }
      }
      if (!handlerFound) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    }
  });
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");

import * as net from "node:net";

const getRequestHandlers = new Map<string | RegExp, (socket: net.Socket, req: string) => void>([
  ['/', (socket) => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  }],
  [/^\/echo\/.+$/, (socket, req) => {
    const echoedString = req.split(' ')[1].match(/^\/echo\/(.+)$/)![1];
    console.log("the string:", echoedString);
    socket.write([
      "HTTP/1.1 200 OK",
      "Content-Type: text/plain",
      `Content-Length: ${echoedString.length}`,
      "",
      echoedString
    ].join('\r\n'));
  }]
]);


const server = net.createServer((socket) => {
  socket.on("data", (request) => {
    const requestData = request.toString();
    const [requestMethod, requestTarget] = requestData.split('\r\n')[0].split(' ');
    let noHandlerFound = true;
    if (requestMethod === 'GET') {
      for (const [target, handler] of getRequestHandlers) {
        if (typeof target === 'string' && requestTarget === target) {
          noHandlerFound = false;
          handler(socket, requestData);
          break;
        }
        else if (target instanceof RegExp && target.test(requestTarget)) {
          noHandlerFound = false;
          handler(socket, requestData);
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

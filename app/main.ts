import * as net from "node:net";

const server = net.createServer((socket) => {
  socket.on("data", (request) => {
    const RequestData = request.toString().split('\r\n');
    const [method, target] = RequestData[0].split(' ');
    if (method === 'GET') {
      switch (target) {
        case '/': {
          socket.write("HTTP/1.1 200 OK\r\n\r\n");
          break;
        }
        default: {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      }
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");

import { HttpServer } from "./http";

const server = new HttpServer('localhost', 4221);

server.get("/", (_req, res) => {
  res.status(200);
});

server.get("/echo/:str", (req, res) => {
  res.status(200).header("content-type", "text/plain").body(req.param.str);
});

server.start();

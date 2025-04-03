import { HttpServer } from "./http";

const server = new HttpServer('localhost', 4221);

server.get("/", (_req, res) => {
  res.status(200);
});

server.post("/create/", (_req, res) => {
  res.status(201).header("content-type", "text/plain").body("awawa");
});

server.start();

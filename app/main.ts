import { HttpServer } from "./http";
import path from "node:path";
import fs from "node:fs";

const server = new HttpServer('localhost', 4221);

// todo: 
// - create Router class for route separation (express-like)
// - add argument parsing
// - add better error handling
// - add more method types
// - add cookie support
// - add custom middleware support

server.get("/", (_req, res) => {
  res.status(200);
});

server.get("/echo/:str", (req, res) => {
  res
    .status(200)
    .header("Content-Type", "text/plain")
    .body(req.param.str);
  const encodingHeader = req.header('Accept-Encoding');
  if (encodingHeader && encodingHeader.includes('gzip')) {
    res
      .header('Content-Encoding', "gzip")
      .compress("gzip");
  }
});

server.get("/user-agent", (req, res) => {
  res
    .status(200)
    .header("Content-Type", "text/plain")
    .body(req.header("User-Agent") ?? "");
});

server.get("/files/:filename", async (req, res) => {
  const folder = process.argv[process.argv.indexOf('--directory') + 1];
  const filePath = path.join(folder, req.param.filename);
  const file = Bun.file(filePath);
  if (await file.exists()) {
    res
      .status(200)
      .header('Content-Type', 'application/octet-stream')
      .body(await file.text());
  }
  else {
    res.status(404);
  }
});

server.post("/files/:filename", (req, res) => {
  const folder = process.argv[process.argv.indexOf('--directory') + 1];
  const filePath = path.join(folder, req.param.filename);
  fs.writeFileSync(filePath, req.body);
  res.status(201);
});

server.start();

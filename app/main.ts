import { HttpServer } from "./http";
import path from "node:path";
import fs from "node:fs";

const server = new HttpServer('localhost', 4221);

function delay(t: number) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(true);
    }, t);
  });
}

server.get("/", (_req, res) => {
  res.status(200);
});

server.get("/echo/:str", (req, res) => {
  res
    .status(200)
    .header("Content-Type", "text/plain")
    .body(req.param.str);
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
  await delay(500);
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath);
    res
      .status(200)
      .header('Content-Type', 'application/octet-stream')
      .body(fileContents);
  }
  else {
    res.status(404);
  }

});

server.start();

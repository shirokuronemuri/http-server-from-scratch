import { HttpServer } from "./http";

const server = new HttpServer('localhost', 4221);

server.start();

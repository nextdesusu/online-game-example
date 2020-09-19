import express, { Application } from "express";
import { createServer, Server as HTTPServer } from "http";
import ws from "ws";

export default class Server {
  private app: Application;
  private httpServer: HTTPServer;
  private port: number;
  private socketServer: ws.Server;

  constructor(port: number, clientPort: number) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = port;
    const wss = new ws.Server({ noServer: true });

    this.socketServer = wss;
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.port, () =>
      callback(this.port)
    );
  }
}

import express from "express";
import cors from "cors";
import * as http from "http";
import { Routes } from "./routes/pokerRoutes";

const morgan = require("morgan");
const bodyParser = require("body-parser");

export class PokerServer {
  public routePrv: Routes = new Routes();
  public server: http.Server;
  private app: express.Application;

  constructor() {
    this.createApp();
    this.createServer();
    this.routePrv.routes(this.app, this.server);
    this.listen();
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private createApp(): void {
    this.app = express();
    this.app.use(morgan("common"));
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private listen(): void {
    this.server.listen(this.routePrv.port, () => {
      console.log("Express server listening on port " + this.routePrv.port);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

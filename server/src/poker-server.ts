import express from "express";
import cors from "cors";
import * as http from "http";
import { Routes } from "./routes/pokerRoutes";

const morgan = require("morgan");

var bodyParser = require("body-parser");

export class PokerServer {
  public routePrv: Routes = new Routes();
  public server: http.Server;
  private app: express.Application;
 
  constructor() {
    this.createApp();
    this.createServer();
    this.routePrv.routes(this.app); 
    this.routePrv.sockets(this.server);
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }


  private createApp(): void {
    this.app = express();
    this.app.use(morgan("common"));
    this.app.use(cors());
    this.app.use(bodyParser.json())
  }

  public getApp(): express.Application {
    return this.app;
  }
}

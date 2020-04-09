import { Request, Response, IRoute } from "express";
import express from "express";
import * as http from "http";
import path from "path";
import { PokerController } from "../controllers/pokerController";
export class Routes {
  private io: SocketIO.Server;
  public port: string | number;
  public pokerController: PokerController = new PokerController();

  public static readonly PORT: number = 8080;

  private config(): void {
    this.port = process.env.PORT || Routes.PORT;
  }

  constructor() {
    this.config();
  }

  private socketRouting(server: http.Server) {
    this.io = require("socket.io").listen(server, { origins: "*:*" });
    this.io.on("connection", socket => {
      socket.on("sessionRoom", sessionRoomID => {
        socket.join(sessionRoomID);
      });

      socket.on("disconnect", () => {
        this.pokerController.removeDisconnectedUser(socket);
      });
    });
  }

  public routes(app: express.Application, server: http.Server): void {
    this.socketRouting(server);
    var htmlPath = path.resolve(__dirname + "./../../../client/dist/client/");

    app.route("*.*").get(express.static(htmlPath, { maxAge: "1h" }));

    app.route("/").get((req: Request, res: Response) => {
      res.status(200).sendFile(`/`, { root: htmlPath });
    });

    app.route("/session/*").get((req: Request, res: Response) => {
      res.status(200).sendFile(`/`, { root: htmlPath });
    });

    app.route("/template/businesscards").get((req: Request, res: Response) => {
      this.pokerController.getCardDeck(req, res);
    });

    app.route("/createSession").post((req: Request, res: Response) => {
      this.pokerController.createSession(req, res, this.io);
    });

    app.route("/createUser").post((req: Request, res: Response) => {
      this.pokerController.createUser(req, res, this.io);
    });

    app.route("/startVoting").post((req: Request, res: Response) => {
      this.pokerController.startVoting(req, res, this.io);
    });

    app.route("/stopVoting").post((req: Request, res: Response) => {
      this.pokerController.stopVoting(req, res, this.io);
    });

    app.route("/vote").post((req: Request, res: Response) => {
      this.pokerController.vote(req, res, this.io);
    });
  }
}

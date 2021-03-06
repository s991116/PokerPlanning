import { Request, Response } from "express";
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
    console.log("Socket setup");
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

    app.route("/cardDecks").get((req: Request, res: Response) => {
      this.pokerController.getCardDecks(req, res);
    });

    app.route("/cardDeck").get((req: Request, res: Response) => {
      this.pokerController.getCardDeck(req, res);
    })
    app.route("/createSession").post(async (req: Request, res: Response) => {
      this.pokerController.createSession(req, res, this.io);
    });

    app.route("/createUser").post((req: Request, res: Response) => {
      this.pokerController.createUser(req, res, this.io);
    });

    app.route("/userExists").get((req: Request, res: Response) => {
      this.pokerController.userExists(req, res);
    });
    
    app.route("/newRound").post((req: Request, res: Response) => {
      this.pokerController.newRound(req, res, this.io);
    });

    app.route("/showCards").post((req: Request, res: Response) => {
      this.pokerController.showCards(req, res, this.io).catch((error) => {
        console.log("Error: " + error);
      });
    });

    app.route("/vote").post((req: Request, res: Response) => {
      this.pokerController.vote(req, res, this.io);
    });

    app.route("/changePlayerType").post((req: Request, res: Response) => {
      this.pokerController.changePlayerType(req, res, this.io);
    });

    app.route("/UpdateSocketId").post((req: Request, res: Response) => {
      this.pokerController.updateSocketId(req, res, this.io);
    });

    app.route("/updateName").post((req: Request, res: Response) => {
      this.pokerController.updateName(req, res, this.io);
    });
  }
}
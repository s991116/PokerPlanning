import express from "express";
import cors from "cors";
import * as http from "http";
import { Message } from "./model";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export class ChatServer {
  public static readonly PORT:number = 8080;
  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: string | number;
  private sessionId: string;

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createNewSession(): string {
    this.sessionId = uuidv4();
    return this.sessionId;
  }

  private createApp(): void {
    this.app = express();
    this.app.use(cors());
    var htmlPath = path.resolve(__dirname + "./../../client/dist/client/");
    this.app.get('*.*', express.static(htmlPath, {maxAge: '1y'}));
    this.app.post('/createSession', (req, res) => {
      let id = this.createNewSession();
      console.log("Created session with ID:" + id)

      res.json({ sessionId: this.sessionId });
    })
    this.app.all('*', function (req, res) {
      res.status(200).sendFile(`/`, {root: htmlPath});
  });
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private config(): void {
    this.port = process.env.PORT || ChatServer.PORT;
  }

  private sockets(): void {
    this.io = require("socket.io").listen(this.server, { origins: '*:*'});
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log("Running server on port %s", this.port);
    });

    let sessionStatus = [1,2,3];


    this.io.on('connection', socket => {
      console.log("User connected to soccket");
      socket.on('sessionRoom', (sessionRoomID) => {
          console.log("User joined Room:" + sessionRoomID);
          socket.join(sessionRoomID);

          console.log("Sending to room '"+this.sessionId+"' message topic 'status' and data 'sessionStatus'");
          this.io.sockets.in(this.sessionId).emit("status", "sessionStatus");
      });
    });

    /*
    this.io.on("connect", (socket: any) => {
      console.log("Connected client on port %s.", this.port);
      socket.on("message", (m: Message) => {
        console.log("[server](message): %s", JSON.stringify(m));
        this.io.emit("message", m);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
    */
  }

  public getApp(): express.Application {
    return this.app;
  }
}

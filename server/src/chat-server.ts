import express from "express";
import cors from "cors";
import * as http from "http";
import { Session, User } from "./model";
import path from "path";
var bodyParser = require("body-parser");

export class ChatServer {
  public static readonly PORT:number = 8080;
  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: string | number;
  private sessions : { [key: string]: Session }

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
    this.sessions = {};
  }

  private createNewSession(name: string) : string {
    let session = new Session(name);
    this.sessions[session.id]=session;
    return session.id;
  }

  private createNewUser(sessionId: string) : User {
    let session = this.sessions[sessionId];
    console.log("SessionId to look for users:"+sessionId);
    console.log(session);
    let userName = "User"+session.users.length;
    let user = new User(userName);
    session.users.push(user);
    return user;
  }

  private createApp(): void {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.json())

    var htmlPath = path.resolve(__dirname + "./../../client/dist/client/");
    this.app.get('*.*', express.static(htmlPath, {maxAge: '1y'}));
    
    this.app.post('/createSession', (req, res) => {
      let sessionId = this.createNewSession(req.body.sessionName);
      console.log("Created session with ID:" + sessionId);

      res.json({ sessionId: sessionId });
    })

    this.app.post('/createUser', (req, res) => {
      console.log(req.body);
      let user = this.createNewUser(req.body.sessionId);
      res.json(user);
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

    let sessionStatus = "Dummy Session Status text";

    this.io.on('connection', socket => {
      console.log("User connected to soccket");
      socket.on('sessionRoom', (sessionRoomID) => {
          console.log("User joined Room:" + sessionRoomID);
          socket.join(sessionRoomID);
          console.log("Sending to room '"+sessionRoomID+"' message topic 'status' and data 'sessionStatus'");
          this.io.sockets.in(sessionRoomID).emit("status",sessionStatus);
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

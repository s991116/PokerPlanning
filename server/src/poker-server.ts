import express from "express";
import cors from "cors";
import * as http from "http";
import { Session, User, VotingState } from "./model";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Routes } from "./routes/pokerRoutes";

const morgan = require("morgan");

var bodyParser = require("body-parser");

export class PokerServer {
  public static readonly PORT:number = 8080;
  public routePrv: Routes = new Routes();

  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: string | number;
  private sessions : { [key: string]: Session }
  private socketIdWithSession : { [sessionId: string]: string}

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
    this.sessions = {};
    this.socketIdWithSession = {};
    this.routePrv.routes(this.app); 
  }

  private createNewSession(name: string) : string {
    let session = new Session(uuidv4(), name);
    this.sessions[session.id]=session;
    return session.id;
  }

  private createNewUser(sessionId: string, socketId: string) : User {
    this.socketIdWithSession[socketId] = sessionId;

    let session = this.sessions[sessionId];
    let userName = "User"+session.users.length;
    let user = new User(uuidv4(), userName, socketId);
    session.users.push(user);
    return user;
  }

  private removeDisconnectedUser(socket: SocketIO.Socket) : void {
    let sessionId = this.socketIdWithSession[socket.id];
    if(sessionId)
    { 
      let users = this.sessions[sessionId].users;
      if(users) {
        users.forEach( (item, index) => {
          if(item.socketId === socket.id) users.splice(index,1);
        });
        socket.in(sessionId).emit("status",this.sessions[sessionId]);
      }
    }
  }

  private createApp(): void {
    this.app = express();
    this.app.use(morgan("common"));
    this.app.use(cors());
    this.app.use(bodyParser.json())
    
    this.app.post('/createSession', (req, res) => {
      let sessionId = this.createNewSession(req.body.sessionName);
      this.io.in(sessionId).emit("status", this.sessions[sessionId]);
      res.json({ sessionId: sessionId });
    });

    this.app.post('/createUser', (req, res) => {
      let sessionId = req.body.sessionId;
      let socketId = req.body.socketId;

      if(this.sessions[sessionId])
      {
        let user = this.createNewUser(sessionId, socketId);
        this.io.in(sessionId).emit("status", this.sessions[sessionId]);
        res.json(user);  
      }
      else
      {
          res.status(400).json({
            status: 'error',
            error: 'sessionId do not exists',
          });
      }
    });

    this.app.post('/startVoting', (req, res) => {
      let sessionId = req.body.id;
      if(this.sessions[sessionId]) {
        let session = this.sessions[sessionId];
        session.state = VotingState.Voting;
        this.io.in(sessionId).emit("status",this.sessions[sessionId]);
        res.json(session);
      }
      else
      {
          res.status(400).json({
            status: 'error',
            error: 'sessionId do not exists',
          });
      }
    });

    this.app.post('/stopVoting', (req, res) => {
      let sessionId = req.body.id;
      if(this.sessions[sessionId]) {
        let session = this.sessions[sessionId];
        session.state = VotingState.Result;
        this.io.in(sessionId).emit("status",this.sessions[sessionId]);
        res.json(session);
      }
      else
      {
          res.status(400).json({
            status: 'error',
            error: 'sessionId do not exists',
          });
      }
    });

    this.app.post('/resetVoting', (req, res) => {
      let sessionId = req.body.id;
      if(this.sessions[sessionId]) {
        let session = this.sessions[sessionId];
        session.state = VotingState.WaitingToVote;
        this.io.in(sessionId).emit("status",this.sessions[sessionId]);
        res.json(session);
      }
      else
      {
          res.status(400).json({
            status: 'error',
            error: 'sessionId do not exists',
          });
      }
    });

    this.app.post('/vote', (req, res) => {
      let sessionId = req.body.sessionId;
      let userId = req.body.userId;
      let cardValue = req.body.cardValue;
      let session = this.sessions[sessionId];
      if(session) {
        let user = session.users.find(i => i.id === userId);
        if(user) {
          user.card = cardValue;
          user.played = true;
          this.io.in(sessionId).emit("status",this.sessions[sessionId]);
          res.json(session);  
        }
        else
        {
            res.status(400).json({
              status: 'error',
              error: 'sessionId do not exists',
            });
        }
      }
      else
      {
          res.status(400).json({
            status: 'error',
            error: 'sessionId do not exists',
          });
      }
    });
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private config(): void {
    this.port = process.env.PORT || PokerServer.PORT;
  }

  private sockets(): void {
    this.io = require("socket.io").listen(this.server, { origins: '*:*'});
  }

  private listen(): void {
    this.server.listen(this.port, () => {
    });

    this.io.on('connection', socket => {
      socket.on('sessionRoom', (sessionRoomID) => {
          socket.join(sessionRoomID);
      });
      socket.on('disconnect', () => {
        this.removeDisconnectedUser(socket);
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

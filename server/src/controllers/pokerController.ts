import * as mongoose from "mongoose";
import { SessionSchema } from "../model/sessionModel";
import { Request, Response } from "express";
import { Session, User, VotingState, CardDeck, Card } from "./../model";
import { v4 as uuidv4 } from "uuid";

const Contact = mongoose.model("SessionSchema", SessionSchema);

export class PokerController {
  private sessions: { [key: string]: Session };
  private socketIdWithSession: { [sessionId: string]: string };
  private cardDeck: CardDeck = new CardDeck([
    new Card("Select BusinesValue-Card", undefined, true),
    new Card("0 Point", 0, false),
    new Card("300 Point", 300, false),
    new Card("600 Point", 600, false),
    new Card("800 Point", 800, false),
    new Card("900 Point", 900, false),
    new Card("975 Point", 975, false),
    new Card("990 Point", 990, false),
    new Card("1000 Point", 1000, false),
    new Card("? Point", undefined, false),
    new Card("Trash", undefined, false)
  ]);

  constructor() {
    this.sessions = {};
    this.socketIdWithSession = {};
  }

  public createSession(req: Request, res: Response, io: SocketIO.Server) {
    let session = new Session(uuidv4(), req.body.sessionName);
    let sessionId = session.id;
    this.sessions[sessionId] = session;
    io.in(sessionId).emit("status", this.sessions[sessionId]);
    res.json({ sessionId: sessionId });
  }

  private createNewUser(sessionId: string, socketId: string): User {
    this.socketIdWithSession[socketId] = sessionId;

    let session = this.sessions[sessionId];
    let userName = "User" + session.users.length;
    let user = new User(uuidv4(), userName, socketId);
    session.users.push(user);
    return user;
  }

  public createUser(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let socketId = req.body.socketId;

    if (this.sessions[sessionId]) {
      let user = this.createNewUser(sessionId, socketId);
      io.in(sessionId).emit("status", this.sessions[sessionId]);
      res.json(user);
    } else {
      res.status(400).json({
        status: "error",
        error: "sessionId do not exists"
      });
    }
  }

  public removeDisconnectedUser(socket: SocketIO.Socket) {
    let sessionId = this.socketIdWithSession[socket.id];
    if (sessionId) {
      let users = this.sessions[sessionId].users;
      if (users) {
        users.forEach((item: any, index: any) => {
          if (item.socketId === socket.id) users.splice(index, 1);
        });
        socket.in(sessionId).emit("status", this.sessions[sessionId]);
      }
    }
  }

  public startVoting(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.id;
    if (this.sessions[sessionId]) {
      let session = this.sessions[sessionId];
      session.state = VotingState.Voting;
      this.resetAllVoting(session);
      io.in(sessionId).emit("status", this.sessions[sessionId]);
      res.json(session);
    } else {
      res.status(400).json({
        status: "error",
        error: "sessionId do not exists"
      });
    }
  }

  private resetAllVoting(session: Session): void {
    session.users.forEach(user => {
      user.played = false;
      user.cardIndex = 1;
    });
  }

  public stopVoting(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.id;
    if (this.sessions[sessionId]) {
      let session = this.sessions[sessionId];
      session.state = VotingState.Result;
      io.in(sessionId).emit("status", this.sessions[sessionId]);
      res.json(session);
    } else {
      res.status(400).json({
        status: "error",
        error: "sessionId do not exists"
      });
    }
  }

  public updateName(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let userName = req.body.userName;
    let userId = req.body.userId;
    let session = this.sessions[sessionId];
    if (session) {
      let user = session.users.find((i: any) => i.id === userId);
      if (user) {
        user.name = userName;
        this.updateSessionState(session);

        io.in(sessionId).emit("status", this.sessions[sessionId]);
        res.json(session);
      } else {
        res.status(400).json({
          status: "error",
          error: "userID do not exists"
        });
      }
    } else {
      res.status(400).json({
        status: "error",
        error: "sessionId do not exists"
      });
    }
  }

  public vote(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let userId = req.body.userId;
    let cardValue = req.body.cardValue;
    let session = this.sessions[sessionId];
    if (session) {
      let user = session.users.find((i: any) => i.id === userId);
      if (user) {
        user.cardIndex = cardValue;
        user.played = true;

        this.updateSessionState(session);

        io.in(sessionId).emit("status", this.sessions[sessionId]);
        res.json(session);
      } else {
        res.status(400).json({
          status: "error",
          error: "userID do not exists"
        });
      }
    } else {
      res.status(400).json({
        status: "error",
        error: "sessionId do not exists"
      });
    }
  }

  private updateSessionState(session: Session): void {
    let allPlayersPlayed = true;
    session.users.forEach(user => {
      if (!user.played && user.isPlaying) {
        allPlayersPlayed = false;
      }
    });
    if (allPlayersPlayed) {
      session.state = VotingState.Result;
    }
  }

  public getCardDeck(req: Request, res: Response) {
    res.json(JSON.stringify(this.cardDeck));
  }
}

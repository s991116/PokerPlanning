import { Request, Response } from "express";
import { Session, User, VotingState, CardDeck, Card } from "./../model";
import { v4 as uuidv4 } from "uuid";
import { DB } from "./db";

export class PokerController {
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
    new Card("Trash", undefined, false),
  ]);

  constructor() {
    this.socketIdWithSession = {};
  }

  public async createSession(req: Request, res: Response, io: SocketIO.Server) {
    let _state: VotingState = "voting";
    let s = new DB.Models.Session.Model({
      name: req.body.sessionName,
      state: _state,
    });
    await s.save();
    //ToDo Change to save with function, where object has id

    io.in(s._id).emit("status", s);
    res.json({ sessionId: s._id });
  }

  public async createUser(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let socketId = req.body.socketId;
    DB.Models.Session.Model.findById(sessionId, async (err: any, session:any) => {
      if (session) {
        let user = {
          _id: uuidv4(),
          name: "User",
          socketId: socketId,
          cardIndex: 0,
          played: false,
          isPlaying: true
        }
        session.users.push(user);
        this.socketIdWithSession[socketId] = sessionId;
        await session.save();
        io.in(sessionId).emit("status", session);
        res.json(user);
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public async removeDisconnectedUser(socket: SocketIO.Socket) {
    let sessionId = this.socketIdWithSession[socket.id];
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session:any) => {
      if (session) {
        let users = session.users;
        if (users) {
          users.forEach((item: any, index: any) => {
            if (item.socketId === socket.id) {
              users.splice(index, 1);
            }
          });
        }
        await session.save((err:any,s:any) => {
          if(s) {
            socket.in(sessionId).emit("status", session);
          } else
          {
            console.log("Error removing player:" + err);
          }
        });        
      }
    });
  }

  public async newRound(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.id;
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session:any) => {
      if (session) {
        session.state = "voting";
        session.users.forEach((user: any) => {
          user.played = false;
          user.cardIndex = 0;
        });
        await session.save();
        io.in(sessionId).emit("status", session);
        res.json(session);
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public async showCards(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.id;
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        session.state = "result";
        await session.save();
        io.in(sessionId).emit("status", session);
        res.json(session);
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public async updateName(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.id;
    let userName = req.body.userName;
    let userId = req.body.userId;
    console.log("sessionId: " + sessionId)
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        let user = session.users.find((i: any) => i._id === userId);
        if (user) {
          user.name = userName;
          await session.save();
          io.in(sessionId).emit("status", session);
          res.json(session);
        } else {
          res.status(400).json({
            status: "error",
            error: "userID do not exists",
          });
        }
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public async vote(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let userId = req.body.userId;
    let cardValue = req.body.cardValue;

    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        console.log(session.users);
        console.log(userId)
        let user = session.users.find((i: any) => i._id === userId);
        if (user) {
          user.cardIndex = cardValue;
          user.played = true;
          await session.save();
          io.in(sessionId).emit("status", session);
          res.json(session);
        } else {
          res.status(400).json({
            status: "error",
            error: "userID do not exists",
          });
        }
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public async changePlayerType(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let userId = req.body.userId;
    let playing = req.body.playing;
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        let user = session.users.find((i: any) => i._id === userId);
        if (user) {
          user.isPlaying = playing;
          if (!playing) user.cardIndex = 0;
          await session.save();
          io.in(sessionId).emit("status", session);
          res.json(session);
        } else {
          res.status(400).json({
            status: "error",
            error: "userID do not exists",
          });
        }
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public getCardDeck(req: Request, res: Response) {
    res.json(JSON.stringify(this.cardDeck));
  }
}
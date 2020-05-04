import { Request, Response } from "express";
import { Session, User, VotingState, CardDeck, Card } from "./../model";
import { v4 as uuidv4 } from "uuid";
import { DB } from "./db";

export class PokerController {
  private socketIdWithSession: { [sessionId: string]: string };
  private cardDecks: CardDeck[] = [
    new CardDeck("Story Points", [
      new Card("Select Story Points", undefined, true),
      new Card("0 Point", 0, false),
      new Card("1/2 Point", 300, false),
      new Card("1 Point", 600, false),
      new Card("2 Point", 800, false),
      new Card("3 Point", 900, false),
      new Card("5 Point", 975, false),
      new Card("8 Point", 990, false),
      new Card("13 Point", 1000, false),
      new Card("20 Point", 1000, false),
      new Card("40 Point", 1000, false),
      new Card("? Point", undefined, false),
      new Card("Infinity Point", undefined, false),
      new Card("Sell", undefined, false),
    ]),
    new CardDeck("Business Value", [
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
    ]),
    new CardDeck("T-Shirt Estimate", [
      new Card("Select Estimation-Card", undefined, true),
      new Card("XS: <= 1 Sprint", 1, false),
      new Card("S:  <= 2 Sprint", 2, false),
      new Card("M:  <= 4 Sprint", 4, false),
      new Card("L:  <= 8 Sprint", 8, false),
      new Card("XL: <= 16 Sprint", 16, false),
      new Card("XXL > 16 Sprint", 32, false),
    ]),
    new CardDeck("Delegation", [
      new Card("Select Delegation type", undefined, true),
      new Card("Tell - I will tell them", 1, false),
      new Card("Sell - I will try and sell it to them", 2, false),
      new Card("Consult - I will consult and then decide", 3, false),
      new Card("Agree - We will agree together", 4, false),      
      new Card("Advice - I will advice but they decide", 5, false),
      new Card("Inquire - I will inquire after they decide", 6, false),
      new Card("Delegate - I will fully delegate", 7, false),
    ]),
    new CardDeck("Assessment Estimation", [
      new Card("Select Assessment card", undefined, true),
      new Card("0 - Impeeded", 0, false),
      new Card("1 - In Transition", 1, false),
      new Card("2 - Sustainable", 2, false),
      new Card("3 - Agile", 3, false),      
      new Card("4 - Ideal", 4, false),
    ]),
  ];

  constructor() {
    this.socketIdWithSession = {};
  }

  public async createSession(req: Request, res: Response, io: SocketIO.Server) {
    let _state: VotingState = "voting";
    let s = new DB.Models.Session.Model({
      name: req.body.sessionName,
      cardDeckTemplateName: req.body.cardDeckTemplateName,
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
    DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {        
        let user = new User(uuidv4(), "User", socketId, session.cardDeckTemplateName);
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

  public async userExists(req: Request, res: Response) {
    let sessionId = req.query.sessionId;
    let userId = req.query.userId;
    console.log("SessionId:" + sessionId);
    console.log("UserId:" + userId);
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        let user = session.users.find((i: User) => i._id === userId);
        if (user) {
          res.json(true);
        }
      }
      res.json(false);
    });
  }

  public async updateSocketId(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let socketId = req.body.socketId;
    let userId = req.body.userId;
    DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        console.log("Find UserID: " + userId);
        console.log("Session id used" + sessionId);
        console.log(session.users);
        let user = session.users.find((i: User) => i._id === userId);
        if (user) {
          let oldSocketId = user.socketId;
          user.socketId = socketId;
          await session.save();
          this.socketIdWithSession[socketId] = sessionId;
          delete this.socketIdWithSession[oldSocketId];
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

  public async removeDisconnectedUser(socket: SocketIO.Socket) {
    let sessionId = this.socketIdWithSession[socket.id];
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      if (session) {
        let users = session.users;
        if (users) {
          users.forEach((item: any, index: any) => {
            if (item.socketId === socket.id) {
              users.splice(index, 1);
            }
          });
        }
        await session.save((err: any, s: any) => {
          if (s) {
            socket.in(sessionId).emit("status", session);
          } else {
            console.log("Error removing player:" + err);
          }
        });
      }
    });
  }

  public async newRound(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.id;
    await DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
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
    console.log("sessionId: " + sessionId);
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
        console.log(userId);
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

  public getCardDecks(req: Request, res: Response) {
    res.json(JSON.stringify(this.cardDecks));
  }
}

import { Request, Response } from "express";
import { User, VotingState, Session } from "./../model";
import { v4 as uuidv4 } from "uuid";
import { DB } from "./db";
import { CardDeckList } from "./cardDecks";
export class PokerController {
  private socketIdWithSession: { [sessionId: string]: string };

  constructor() {
    this.socketIdWithSession = {};
    this.removeAllUsers();
  }

  private removeAllUsers() {
    //Remove all users, if reboot has happend, now user should exists
    DB.Models.Session.Model.find({ "users.0": { $exists: true } }, (err: any, sessions: any) => {
      sessions.forEach((s: any) => {
        s.users = [];
        s.save();
      });
    });
  }

  public async createSession(req: Request, res: Response, io: SocketIO.Server) {
    let _state: VotingState = "voting";
    let s = new DB.Models.Session.Model({
      name: req.body.sessionName,
      cardDeckTemplateName: req.body.cardDeckTemplateName,
      state: _state,
    });
    await s.save();

    io.in(s._id).emit("status", s);
    res.json({ sessionId: s._id });
  }

  public async createUser(req: Request, res: Response, io: SocketIO.Server) {
    let sessionId = req.body.sessionId;
    let socketId = req.body.socketId;
    let storageUser = req.body.storageUser as User;
    DB.Models.Session.Model.findById(sessionId, async (err: any, session: any) => {
      let user: User;
      if (session) {
        if (storageUser) {
          storageUser.socketId = socketId;
          console.log("Searching for storageUser id:" + storageUser._id);
          let uIndex = session.users.findIndex((u: User) => u._id == storageUser._id);

          if (uIndex > 0) {
            session.users.splice(uIndex, 1, storageUser);
            user = storageUser;

            console.log("Update existing user with id: " + storageUser._id);
          } else {
            storageUser._id = uuidv4();
            user = storageUser;
            console.log("Adding new with old settings except ID, user with id: " + user._id);
            session.users.push(user);
          }
        } else {
          user = new User(uuidv4(), "User", socketId);
          console.log("Adding new user with id: " + user._id);
          session.users.push(user);
        }
        this.socketIdWithSession[socketId] = sessionId;
        await session.save();
        io.in(sessionId).emit("status", session);
        let response: any = { user: user, session: session };
        res.json(response);
      } else {
        res.status(400).json({
          status: "error",
          error: "sessionId do not exists",
        });
      }
    });
  }

  public async getCardDeck(req: Request, res: Response) {
    let sessionId = req.query.sessionId;
    console.log("Get Cardname for SessionId: " + sessionId);
    DB.Models.Session.Model.findById(sessionId, async (err: any, session: Session) => {
      if (session) {
        res.json(session.cardDeckTemplateName);
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
        console.log("Find User to rename:" + userId);
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
    res.json(JSON.stringify(CardDeckList.cardDecks));
  }
}

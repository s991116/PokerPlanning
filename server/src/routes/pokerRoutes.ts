import {Request, Response, IRoute} from "express";
import express from "express";
import * as http from "http";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { User, VotingState } from "./../model";
import { PokerController } from "../controllers/pokerController";

export class Routes {   
    
    private io: SocketIO.Server;
    public port: string | number;
    public pokerController: PokerController = new PokerController();

    public static readonly PORT:number = 8080;

    private config(): void {
      this.port = process.env.PORT || Routes.PORT;
    }
    
    constructor() {
        this.config();
    }

    private removeDisconnectedUser(socket: SocketIO.Socket) : void {
      let sessionId = this.pokerController.socketIdWithSession[socket.id];
      if(sessionId)
      { 
        let users = this.pokerController.sessions[sessionId].users;
        if(users) {
          users.forEach( (item: any, index: any) => {
            if(item.socketId === socket.id) users.splice(index,1);
          });
          socket.in(sessionId).emit("status",this.pokerController.sessions[sessionId]);
        }
      }
    }

    private socketRouting() {
      this.io.on('connection', socket => {
        socket.on('sessionRoom', (sessionRoomID) => {
          socket.join(sessionRoomID);
        });
      
        socket.on('disconnect', () => {
          this.removeDisconnectedUser(socket);
        });
      });
    }

    private sockets(server:http.Server): void {
        this.io = require("socket.io").listen(server, { origins: '*:*'});
    }

    public routes(app: express.Application, server: http.Server): void {   
        this.sockets(server);
        this.socketRouting();
        var htmlPath = path.resolve(__dirname + "./../../../client/dist/client/");        
        
        app.route('*.*').get(express.static(htmlPath, {maxAge: '1y'}));

        app.route('/').get((req:any, res:any) => {
            res.status(200).sendFile(`/`, {root: htmlPath});
        });

        app.route('/session/*').get((req:any, res:any) => {
            res.status(200).sendFile(`/`, {root: htmlPath});
        });

        app.route('/createSession').post((req: Request, res: Response) => {
            this.pokerController.createSession(req, res, this.io);
        });

        app.route('/createUser').post((req: Request, res: Response) => {
            this.pokerController.createUser(req, res, this.io);
        });
      
        app.route('/startVoting').post((req: any, res: any) => {
          this.pokerController.startVoting(req, res, this.io)
        });
      
        app.route('/stopVoting').post((req: any, res: any) => {
            this.pokerController.stopVoting(req, res, this.io);
        });
      
        app.route('/resetVoting').post((req: any, res: any) => {
            let sessionId = req.body.id;
            if(this.pokerController.sessions[sessionId]) {
              let session = this.pokerController.sessions[sessionId];
              session.state = VotingState.WaitingToVote;
              this.io.in(sessionId).emit("status",this.pokerController.sessions[sessionId]);
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
      
          app.route('/vote').post((req: any, res: any) => {
            let sessionId = req.body.sessionId;
            let userId = req.body.userId;
            let cardValue = req.body.cardValue;
            let session = this.pokerController.sessions[sessionId];
            if(session) {
              let user = session.users.find((i: any) => i.id === userId);
              if(user) {
                user.card = cardValue;
                user.played = true;
                this.io.in(sessionId).emit("status",this.pokerController.sessions[sessionId]);
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
}
import {Request, Response, IRoute} from "express";
import express from "express";
import * as http from "http";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Session, User, VotingState } from "./../model";

export class Routes {   
    
    private io: SocketIO.Server;
    private sessions : { [key: string]: Session }
    private socketIdWithSession : { [sessionId: string]: string}
    private port: string | number;

    public static readonly PORT:number = 8080;

    private config(): void {
      this.port = process.env.PORT || Routes.PORT;
    }
    
    constructor() {
        this.config();
        this.sessions = {};
        this.socketIdWithSession = {}; 
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
          users.forEach( (item: any, index: any) => {
            if(item.socketId === socket.id) users.splice(index,1);
          });
          socket.in(sessionId).emit("status",this.sessions[sessionId]);
        }
      }
    }
    
    private listen(server: any): void {
      server.listen(Routes.PORT, () => {
          console.log("Express server listening on port " + Routes.PORT);
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

    public sockets(server:any): void {
        this.io = require("socket.io").listen(server, { origins: '*:*'});
        this.listen(server);
    }
    
    public routes(app:any): void {   

        var htmlPath = path.resolve(__dirname + "./../../../client/dist/client/");        
        
        app.route('*.*').get(express.static(htmlPath, {maxAge: '1y'}));

        app.route('/').get((req:any, res:any) => {
            res.status(200).sendFile(`/`, {root: htmlPath});
        });

        app.route('/session/*').get((req:any, res:any) => {
            res.status(200).sendFile(`/`, {root: htmlPath});
        });
        
        app.route('/createSession').post((req:any, res:any) => {
            let sessionId = this.createNewSession(req.body.sessionName);
            this.io.in(sessionId).emit("status", this.sessions[sessionId]);
            res.json({ sessionId: sessionId });
        });

        app.route('/createUser').post((req: any, res: any) => {
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
      
        app.route('/startVoting').post((req: any, res: any) => {
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
      
          app.route('/stopVoting').post((req: any, res: any) => {
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
      
          app.route('/resetVoting').post((req: any, res: any) => {
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
      
          app.route('/vote').post((req: any, res: any) => {
            let sessionId = req.body.sessionId;
            let userId = req.body.userId;
            let cardValue = req.body.cardValue;
            let session = this.sessions[sessionId];
            if(session) {
              let user = session.users.find((i: any) => i.id === userId);
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
}
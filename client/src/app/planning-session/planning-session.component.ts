import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as io from 'socket.io-client';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { HttpClient } from '@angular/common/http';
import { Session, User, VotingState } from "./../model/";

const USERNAME_SESSION_KEY = 'UserInfo';

@Component({
  selector: 'app-planning-session',
  templateUrl: './planning-session.component.html',
  styleUrls: ['./planning-session.component.css']
})
export class PlanningSessionComponent implements OnInit {
  sessionId:string;
  sessionName:string;
  userDefined:boolean;
  userName:string;
  userId:string;
  session:Session;
  startVotingDisabled: boolean;
  stopVotingDisabled: boolean;
  resetVotingDisabled: boolean;

  constructor(private _Activatedroute:ActivatedRoute, @Inject(SESSION_STORAGE) private storage: StorageService, private http: HttpClient) { 
      this._Activatedroute.paramMap.subscribe(params => { 
      this.sessionId = params.get('id'); 
      console.log("Room Session Id:" + this.sessionId);
      this.session = new Session("", "");
    });
  }

  startVotingForm(): void {
    this.http.post("/startVoting",this.session)
    .subscribe(
        (val: any) => {            
        },
        response => {
            console.log("POST call in error", response);
        },
        () => {
        });
  }

  stopVotingForm(): void {
    this.http.post("/stopVoting",this.session)
    .subscribe(
        (val: any) => {            
        },
        response => {
            console.log("POST call in error", response);
        },
        () => {
        });
  }

  resetVotingForm(): void {
    this.http.post("/resetVoting",this.session)
    .subscribe(
        (val: any) => {            
        },
        response => {
            console.log("POST call in error", response);
        },
        () => {
        });
  }

  voteForm(frmElement): void {
    let cardValue = frmElement.form.value.valueName;
    console.log(cardValue);
    this.http.post("/vote",{sessionId: this.sessionId, userId: this.userId, cardValue: cardValue})
    .subscribe(
        (val: any) => {
        },
        response => {
            console.log("POST call in error", response);
        },
        () => {
        });
  }

  setButtonState(state: VotingState): void {
    switch(state) {
      case VotingState.WaitingToVote:
        this.startVotingDisabled = false;
        this.stopVotingDisabled = true;
        this.resetVotingDisabled = true;
        break;

      case VotingState.Voting:
        this.startVotingDisabled = true;
        this.stopVotingDisabled = false;
        this.resetVotingDisabled = false;
        break;

      case VotingState.Result:
        this.startVotingDisabled = false;
        this.stopVotingDisabled = true;
        this.resetVotingDisabled = false;
        break;
      
    }
  }

  ngOnInit(): void {
    this.userDefined = this.storage.has(USERNAME_SESSION_KEY);
    console.log("Starting Socket connection from User to Server")
    const socket = io("http://localhost:8080");
    socket.on('connect', () => {
      console.log("Connected to socket with socket id:" + socket.id);
      console.log("Setting room id to : " + this.sessionId);
      socket.emit('sessionRoom', this.sessionId);

      if(!this.userDefined) {
        this.http.post("/createUser",{sessionId: this.sessionId, socketId: socket.id})
        .subscribe(
            (val: any) => {
                console.log("Name is now: "+val.name); 
                this.userName = val.name; 
                this.userId = val.id;        
            },
            response => {
                console.log("POST call in error", response);
            },
            () => {
            });
          };
    });

    socket.on('status', (data) => {
      this.session = data as Session;
      console.log(this.session);
      console.log("Session name before:" + this.sessionName);
      this.sessionName = this.session.name;
      this.setButtonState(this.session.state);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as io from 'socket.io-client';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { HttpClient } from '@angular/common/http';

const USERNAME_SESSION_KEY = 'UserInfo';

@Component({
  selector: 'app-planning-session',
  templateUrl: './planning-session.component.html',
  styleUrls: ['./planning-session.component.css']
})
export class PlanningSessionComponent implements OnInit {
  sessionId:string;
  userDefined:boolean;
  userName:string;

  constructor(private _Activatedroute:ActivatedRoute, @Inject(SESSION_STORAGE) private storage: StorageService, private http: HttpClient) { 
      this._Activatedroute.paramMap.subscribe(params => { 
      this.sessionId = params.get('id'); 
      console.log("Room Session Id:" + this.sessionId);
    });
  }

  ngOnInit(): void {

    this.userDefined = this.storage.has(USERNAME_SESSION_KEY);
    if(!this.userDefined) {
    this.http.post("/createUser",{sessionId: this.sessionId})
    .subscribe(
        (val: any) => {
            console.log("Name is now"+val.name); 
            this.userName = val.name;         
        },
        response => {
            console.log("POST call in error", response);
        },
        () => {
        });
      };
//      this.storage.set(USERNAME_SESSION_KEY, "John Doe");
//      console.log("User name:" + this.storage.get(USERNAME_SESSION_KEY))

    console.log("Starting Socket connection from User to Server")
    const socket = io("http://localhost:8080");
    socket.on('connect', () => {
      console.log("Connected to socket");
      console.log("Setting room id to : " + this.sessionId);
      socket.emit('sessionRoom', this.sessionId);
    });

    socket.on('status', function(data) {
      console.log('Incoming message:', data);
    });
  }
}

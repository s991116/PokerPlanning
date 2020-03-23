import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-planning-session',
  templateUrl: './planning-session.component.html',
  styleUrls: ['./planning-session.component.css']
})
export class PlanningSessionComponent implements OnInit {
  roomId:string;

  constructor(private _Activatedroute:ActivatedRoute) { 
      this._Activatedroute.paramMap.subscribe(params => { 
      this.roomId = params.get('id'); 
      console.log("Room Session Id:" + this.roomId);
    });
  }

  ngOnInit(): void {
    console.log("Starting Socket connection from User to Server")
    const socket = io("http://localhost:8080");
    socket.on('connect', () => {
      console.log("Connected to socket");
      console.log("Setting room id to : " + this.roomId);
      socket.emit('sessionRoom', this.roomId);
   });

   socket.on('status', function(data) {
    console.log('Incoming message:', data);
 });
  }

}

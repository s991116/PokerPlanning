import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SESSION_STORAGE, StorageService } from "ngx-webstorage-service";
import { Inject } from "@angular/core";

const USERNAME_SESSION_KEY = "UserInfo";
const SESSION_KEY = "SessionInfo";


@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css']
})
export class CreateSessionComponent {

  constructor(private http: HttpClient, private router: Router,
    @Inject(SESSION_STORAGE) private storage: StorageService,) {
  }

  submitForm(frmElement) {
    this.http.post("/createSession",frmElement.form.value)
    .subscribe(
        (val: any) => {
          let sessionURL = "session/"+ val.sessionId;
          this.storage.remove(USERNAME_SESSION_KEY);
          this.storage.set(SESSION_KEY, val);
          this.router.navigate([sessionURL]);            
        },
        response => {
            console.log("POST call in error", response);
        },
        () => {
        });
  }
}
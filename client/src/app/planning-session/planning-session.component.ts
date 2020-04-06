import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as io from "socket.io-client";
import { Inject } from "@angular/core";
import { SESSION_STORAGE, StorageService } from "ngx-webstorage-service";
import { HttpClient } from "@angular/common/http";
import { Session, VotingState, Card, CardDeck } from "./../model/";
import { ClipboardService } from "ngx-clipboard";

const USERNAME_SESSION_KEY = "UserInfo";

@Component({
  selector: "app-planning-session",
  templateUrl: "./planning-session.component.html",
  styleUrls: ["./planning-session.component.css"]
})
export class PlanningSessionComponent implements OnInit {
  sessionId: string;
  sessionName: string;
  userDefined: boolean;
  sessionExists: boolean;
  userName: string;
  userId: string;
  session: Session;
  startVotingDisabled: boolean;
  stopVotingDisabled: boolean;
  resetVotingDisabled: boolean;
  cards: Card[];

  constructor(
    private _Activatedroute: ActivatedRoute,
    @Inject(SESSION_STORAGE) private storage: StorageService,
    private _clipboardService: ClipboardService,
    private http: HttpClient
  ) {
    this._Activatedroute.paramMap.subscribe(params => {
      this.sessionId = params.get("id");
      console.log("Room Session Id:" + this.sessionId);
      this.session = new Session("", "");
    });
    this.sessionExists = false;
  }

  startVotingForm(): void {
    this.http.post("/startVoting", this.session).subscribe(
      (val: any) => {},
      response => {
        console.log("POST call in error", response);
      },
      () => {}
    );
  }

  stopVotingForm(): void {
    this.http.post("/stopVoting", this.session).subscribe(
      (val: any) => {},
      response => {
        console.log("POST call in error", response);
      },
      () => {}
    );
  }

  resetVotingForm(): void {
    this.http.post("/resetVoting", this.session).subscribe(
      (val: any) => {},
      response => {
        console.log("POST call in error", response);
      },
      () => {}
    );
  }

  onCardSelected(value: string): void {
    console.log(value);
    this.http
      .post("/vote", {
        sessionId: this.sessionId,
        userId: this.userId,
        cardValue: value
      })
      .subscribe(
        (val: any) => {},
        response => {
          console.log("POST call in error", response);
        },
        () => {}
      );
  }

  setButtonState(state: VotingState): void {
    switch (state) {
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

  copyURLToClipboard(): void {
    this._clipboardService.copyFromContent(window.location.href);
  }

  ngOnInit(): void {
    this.userDefined = this.storage.has(USERNAME_SESSION_KEY);
    const socket = io();
    socket.on("connect", () => {
      socket.emit("sessionRoom", this.sessionId);

      this.http.get("/template/businesscards").subscribe((cardDeckJson: string) => {
        let cardDeck:CardDeck = JSON.parse(cardDeckJson);
        this.cards = cardDeck.cards;
      });

      if (!this.userDefined) {
        this.http
          .post("/createUser", {
            sessionId: this.sessionId,
            socketId: socket.id
          })
          .subscribe(
            (val: any) => {
              this.userName = val.name;
              this.userId = val.id;
              this.sessionExists = true;
            },
            response => {
              this.sessionExists = false;
              console.log("POST call in error", response);
            },
            () => {}
          );
      }
    });

    socket.on("status", data => {
      console.log(data);
      this.session = data as Session;
      this.sessionName = this.session.name;
      this.setButtonState(this.session.state);
    });
  }
}

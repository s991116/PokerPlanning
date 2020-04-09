import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as io from "socket.io-client";
import { Inject } from "@angular/core";
import { SESSION_STORAGE, StorageService } from "ngx-webstorage-service";
import { HttpClient } from "@angular/common/http";
import { Session, VotingState, Card, CardDeck } from "./../model/";
import { FellowPlayerViewModel } from "./../viewModel/";
import { ClipboardService } from "ngx-clipboard";
import { UpdateNameService } from './../updateName/updateName.service';
import { Subject } from 'rxjs';

const USERNAME_SESSION_KEY = "UserInfo";

@Component({
  selector: "app-planning-session",
  templateUrl: "./planning-session.component.html",
  styleUrls: ["./planning-session.component.css"],
  providers: [UpdateNameService]
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
  cards: Card[];
  fellowPlayers: FellowPlayerViewModel[];
  selectedCard;
  updateNameTerm = new Subject<string>();

  constructor(
    private _Activatedroute: ActivatedRoute,
    @Inject(SESSION_STORAGE) private storage: StorageService,
    private _clipboardService: ClipboardService,
    private http: HttpClient,
    private updateNameService: UpdateNameService
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

  onCardSelected(value: string): void {
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
      case VotingState.Voting:
        this.startVotingDisabled = true;
        this.stopVotingDisabled = false;
        break;

      case VotingState.Result:
        this.startVotingDisabled = false;
        this.stopVotingDisabled = true;
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

      this.http
        .get("/template/businesscards")
        .subscribe((cardDeckJson: string) => {
          let cardDeck: CardDeck = JSON.parse(cardDeckJson);
          this.cards = cardDeck.cards;
          this.selectedCard = this.cards[0];
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
              this.updateNameService.updateName(this.sessionId, this.userId, this.updateNameTerm);
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

      this.UpdateViewModel(this.session);
    });
  }

  UpdateViewModel(session: Session) {
    this.fellowPlayers = [];
    session.users.forEach(user => {
      if (user.id !== this.userId) {
        var cardIndex = Math.max(1, user.cardIndex);
        let cardText: string;
        if (user.isPlaying) {
          if (session.state == VotingState.Voting) {
            if (user.played) cardText = "Played card";
            else cardText = "?";
          }
          if (session.state == VotingState.Result) {
            if (user.played) cardText = this.cards[cardIndex].name;
            else cardText = "Did not play";
          }
        } else {
          cardText = "Guest";
        }

        this.fellowPlayers.push(
          new FellowPlayerViewModel(user.name, user.played, cardText)
        );
      } else {
        if (user.isPlaying && !user.played) this.selectedCard = user.cardIndex;
      }
    });
  }
}

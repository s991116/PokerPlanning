import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as io from "socket.io-client";
import { Inject } from "@angular/core";
import { SESSION_STORAGE, StorageService } from "ngx-webstorage-service";
import { HttpClient } from "@angular/common/http";
import { Session, VotingState, Card, CardDeck, User } from "./../model/";
import { FellowPlayerViewModel } from "./../viewModel/";
import { ClipboardService } from "ngx-clipboard";
import { UpdateNameService } from "./../updateName/updateName.service";
import { Subject } from "rxjs";

const USERNAME_SESSION_KEY = "UserInfo";

@Component({
  selector: "app-planning-session",
  templateUrl: "./planning-session.component.html",
  styleUrls: ["./planning-session.component.css"],
  providers: [UpdateNameService],
})
export class PlanningSessionComponent implements OnInit {
  sessionId: string;
  sessionName: string;
  userDefined: boolean;
  sessionExists: boolean;
  userName: string;
  userId: string;
  session: Session;
  newRoundDisabled: boolean;
  showCardsDisabled: boolean;
  cards: Card[];
  fellowPlayers: FellowPlayerViewModel[];
  selectedCard: Card;
  updateNameTerm = new Subject<string>();
  
  selectedPlayingTypes = [
    {
      name: "Player",
      value: true,
    },
    {
      name: "Observer",
      value: false,
    },
  ];
  selectedPlayingType = this.selectedPlayingTypes[0];


  constructor(
    private _Activatedroute: ActivatedRoute,
    @Inject(SESSION_STORAGE) private storage: StorageService,
    private _clipboardService: ClipboardService,
    private http: HttpClient,
    private updateNameService: UpdateNameService
  ) {
    this._Activatedroute.paramMap.subscribe((params) => {
      this.sessionId = params.get("id");
      console.log("Room Session Id:" + this.sessionId);
      this.session = new Session("", "");
    });
    this.sessionExists = false;
  }

  newRoundForm(): void {
    this.http.post("/newRound", this.session).subscribe(
      (val: any) => {},
      (response) => {
        console.log("POST call in error", response);
      },
      () => {}
    );
  }

  showCardsForm(): void {
    this.http.post("/showCards", this.session).subscribe(
      (val: any) => {},
      (response) => {
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
        cardValue: value,
      })
      .subscribe(
        (val: any) => {},
        (response) => {
          console.log("POST call in error", response);
        },
        () => {}
      );
  }

  onPlayerTypeSelected(value: string): void {
    let playing = this.selectedPlayingTypes[value].value;
    this.http
      .post("/changePlayerType", {
        sessionId: this.sessionId,
        userId: this.userId,
        playing: playing,
      })
      .subscribe(
        (val: any) => {},
        (response) => {
          console.log("POST call in error", response);
        },
        () => {}
      );
  }

  setButtonState(state: VotingState): void {
    switch (state) {
      case VotingState.Voting:
        this.newRoundDisabled = true;
        this.showCardsDisabled = false;
        break;

      case VotingState.Result:
        this.newRoundDisabled = false;
        this.showCardsDisabled = true;
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
            socketId: socket.id,
          })
          .subscribe(
            (val: any) => {
              this.userName = val.name;
              this.userId = val.id;
              this.sessionExists = true;
              this.updateNameService.updateName(
                this.sessionId,
                this.userId,
                this.updateNameTerm
              );
            },
            (response) => {
              this.sessionExists = false;
              console.log("POST call in error", response);
            },
            () => {}
          );
      }
    });

    socket.on("status", (data) => {
      console.log(data);
      this.session = data as Session;
      this.sessionName = this.session.name;
      this.UpdateViewModel(this.session);
    });
  }

  UpdateViewModel(session: Session) {
    this.setButtonState(session.state);

    this.fellowPlayers = [];
    session.users.forEach((user) => {
      if (user.id !== this.userId) {
        let cardText = this.getCardText(user, session, true);
        this.fellowPlayers.push(
          new FellowPlayerViewModel(user.name, user.played, cardText)
        );
      } else {
        let cardText = this.getCardText(user, session, false);
        this.selectedCard = this.cards[user.cardIndex];
        this.fellowPlayers.unshift(
          new FellowPlayerViewModel(user.name, user.played, cardText)
        );
        if(user.isPlaying) {
          this.selectedPlayingType = this.selectedPlayingTypes[0];
        } else {
          this.selectedPlayingType = this.selectedPlayingTypes[1];
        }
      }
    });
  }

  private getCardText(user: User, session: Session, opponent: boolean): string {
    var cardIndex = Math.max(1, user.cardIndex);
    let cardText: string;
    if (!user.isPlaying) {
      return "Observer";
    }
    if (opponent) {
      if (session.state == VotingState.Voting) {
        if (user.played) cardText = "Played Card";
        else cardText = "?";
      }
      if (session.state == VotingState.Result) {
        if (user.played) {
          cardText = this.cards[cardIndex].name;
        } else cardText = "No Card Played";
      }
    } else {
      if (user.played) {
        cardText = this.cards[cardIndex].name;
      } else {
        if(session.state == VotingState.Voting)
          cardText = "Select Card";
        else
          cardText = "No Card Played";
      }
    }
    return cardText;
  }
}

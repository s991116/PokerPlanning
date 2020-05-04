import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as io from "socket.io-client";
import { HttpClient } from "@angular/common/http";
import { Session, VotingState, Card, CardDeck, User } from "./../model/";
import { FellowPlayerViewModel } from "./../viewModel/";
import { ClipboardService } from "ngx-clipboard";
import { UpdateNameService } from "./../updateName/updateName.service";
import { Subject } from "rxjs";
import { CardDeckService } from "./../cardDeck/card-deck.service";

@Component({
  selector: "app-planning-session",
  templateUrl: "./planning-session.component.html",
  styleUrls: ["./planning-session.component.css"],
  providers: [UpdateNameService, CardDeckService,
  ],
})
export class PlanningSessionComponent implements OnInit {
  sessionId: string;
  sessionName: string;
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
  socket = io({
    timeout: 20000,
  });

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
    private _clipboardService: ClipboardService,
    private http: HttpClient,
    private updateNameService: UpdateNameService,
    private cardDeckService: CardDeckService,
  ) {}

  newRoundForm(): void {
    this.http
      .post("/newRound", {
        id: this.sessionId,
      })
      .subscribe(
        (val: any) => {},
        (response) => {
          console.log("POST call in error", response);
        },
        () => {}
      );
  }

  showCardsForm(): void {
    this.http
      .post("/showCards", {
        id: this.sessionId,
      })
      .subscribe(
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
      case "voting":
        this.newRoundDisabled = true;
        this.showCardsDisabled = false;
        break;

      case "result":
        this.newRoundDisabled = false;
        this.showCardsDisabled = true;
        break;
    }
  }

  copyURLToClipboard(): void {
    this._clipboardService.copyFromContent(window.location.href);
  }

  ngOnInit(): void {
    this.sessionId = this._Activatedroute.snapshot.params.id;
    this.session = new Session("", "","");
    this.sessionExists = true;
    this.socket.on("connect", () => {
      this.socket.emit("sessionRoom", this.sessionId);
          this.http
            .post("/createUser", {
              sessionId: this.sessionId,
              socketId: this.socket.id,
            })
            .subscribe(
              (val: User) => {
                this.userName = val.name;
                this.userId = val._id;
                this.sessionExists = true;
                this.cardDeckService.getCardDeck(val.cardDeckName).then(c => { this.cards = c.cards});
                this.updateNameService.updateName(
                  this.sessionId,
                  this.userId,
                  this.updateNameTerm
                );              
              },
              (response) => {
                this.sessionExists = false;
              },
              () => {}
            );
      });

    this.socket.on("status", (data) => {
      this.session = data as Session;
      this.sessionName = this.session.name;
      this.UpdateViewModel(this.session);
    });
  }

  ngOnDestroy() {
    this.socket.close();
  }

  UpdateViewModel(session: Session) {
    this.setButtonState(session.state);
    this.fellowPlayers = [];
    session.users.forEach((user) => {
      if (user._id !== this.userId) {
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
        if (user.isPlaying) {
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
      if (session.state == "voting") {
        if (user.played) cardText = "Played Card";
        else cardText = "?";
      }
      if (session.state == "result") {
        if (user.played) {
          cardText = this.cards[cardIndex].name;
        } else cardText = "No Card Played";
      }
    } else {
      if (user.played) {
        cardText = this.cards[cardIndex].name;
      } else {
        if (session.state == "voting") cardText = "Select Card";
        else cardText = "No Card Played";
      }
    }
    return cardText;
  }
}

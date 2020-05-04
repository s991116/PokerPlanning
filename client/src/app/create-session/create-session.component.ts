import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { CardDeckService } from "./../cardDeck/card-deck.service";
import { CardDeck } from "./../model"
@Component({
  selector: "app-create-session",
  templateUrl: "./create-session.component.html",
  styleUrls: ["./create-session.component.css"],
  providers: [CardDeckService],
})
export class CreateSessionComponent {
  constructor(
    private http: HttpClient, 
    private router: Router,
    private cardDeckService: CardDeckService,
    ) {}

    cardDeckTemplates: CardDeck[];
    cardDeckTemplateSelect: string;

    ngOnInit() {
      this.cardDeckService.getAllDecks().then(cardDeckTemplates => {
        this.cardDeckTemplates = cardDeckTemplates;
        this.cardDeckTemplateSelect = this.cardDeckTemplates[0].name;
      });
    }

  submitForm(frmElement) {
    this.http.post("/createSession", frmElement.form.value).subscribe(
      (val: any) => {
        let sessionURL = "session/" + val.sessionId;
        this.router.navigate([sessionURL]);
      },
      (response) => {
        console.log("POST call in error", response);
      },
      () => {}
    );
  }
}

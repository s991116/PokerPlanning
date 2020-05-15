import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CardDeck } from "./../model/";
@Injectable({
  providedIn: "root",
})
export class CardDeckService {
  private cardDecks: Promise<CardDeck[]>;

  constructor(private http: HttpClient) {
    this.cardDecks = new Promise<CardDeck[]>((resolve, reject) => {
      this.http.get("/cardDecks").subscribe((cardDeckJson: string) => {
        resolve(JSON.parse(cardDeckJson));
      });
    });
  }

  getAllDecks(): Promise<CardDeck[]> {
    return this.cardDecks.then((cardDecks) => {
      return cardDecks;
    });
  }

  getCardDeck(templateName: string): Promise<CardDeck> {
    return new Promise((resolve, reject) => {
      this.cardDecks.then((cardDecks) => {
        let cd = cardDecks.find((element, index, array) => {
          return templateName == element.name;
        });
        resolve(cd);
      });
    });
  }
}

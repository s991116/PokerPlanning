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
      this.http.get("/template/cardDecks").subscribe((cardDeckJson: string) => {
        resolve(JSON.parse(cardDeckJson));
      });
    });
  }

  getAllDecks(): Promise<CardDeck[]> {
    return this.cardDecks.then((cardDecks) => {
      return cardDecks;
    });
  }

  getCardDeck(name: string): Promise<CardDeck> {
    return this.cardDecks.then((cardDecks) => {
      console.log("Searching for carddeck name:" + name);
      let cd =  cardDecks.find((element, index, array) => {
        return name == element.name;
      });
      console.log("Found Carddeck:" + cd);
      return cd;
    });
  }
}

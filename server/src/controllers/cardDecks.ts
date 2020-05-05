import { Session, User, VotingState, CardDeck, Card } from "./../model";


export class CardDeckList {
    static readonly cardDecks: CardDeck[] = [
        new CardDeck("Story Points", [
          new Card("Select Story Points", undefined, true),
          new Card("0 Point", 0, false),
          new Card("1/2 Point", 300, false),
          new Card("1 Point", 600, false),
          new Card("2 Point", 800, false),
          new Card("3 Point", 900, false),
          new Card("5 Point", 975, false),
          new Card("8 Point", 990, false),
          new Card("13 Point", 1000, false),
          new Card("20 Point", 1000, false),
          new Card("40 Point", 1000, false),
          new Card("? Point", undefined, false),
          new Card("Infinity Point", undefined, false),
          new Card("Sell", undefined, false),
        ]),
        new CardDeck("Business Value", [
          new Card("Select BusinesValue-Card", undefined, true),
          new Card("0 Point", 0, false),
          new Card("300 Point", 300, false),
          new Card("600 Point", 600, false),
          new Card("800 Point", 800, false),
          new Card("900 Point", 900, false),
          new Card("975 Point", 975, false),
          new Card("990 Point", 990, false),
          new Card("1000 Point", 1000, false),
          new Card("? Point", undefined, false),
          new Card("Trash", undefined, false),
        ]),
        new CardDeck("T-Shirt Estimate", [
          new Card("Select Estimation-Card", undefined, true),
          new Card("XS: <= 1 Sprint", 1, false),
          new Card("S:  <= 2 Sprint", 2, false),
          new Card("M:  <= 4 Sprint", 4, false),
          new Card("L:  <= 8 Sprint", 8, false),
          new Card("XL: <= 16 Sprint", 16, false),
          new Card("XXL > 16 Sprint", 32, false),
        ]),
        new CardDeck("Delegation", [
          new Card("Select Delegation type", undefined, true),
          new Card("Tell - I will tell them", 1, false),
          new Card("Sell - I will try and sell it to them", 2, false),
          new Card("Consult - I will consult and then decide", 3, false),
          new Card("Agree - We will agree together", 4, false),      
          new Card("Advice - I will advice but they decide", 5, false),
          new Card("Inquire - I will inquire after they decide", 6, false),
          new Card("Delegate - I will fully delegate", 7, false),
        ]),
        new CardDeck("Assessment Estimation", [
          new Card("Select Assessment card", undefined, true),
          new Card("0 - Impeeded", 0, false),
          new Card("1 - In Transition", 1, false),
          new Card("2 - Sustainable", 2, false),
          new Card("3 - Agile", 3, false),      
          new Card("4 - Ideal", 4, false),
        ]),
      ];
}
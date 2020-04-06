import { Card } from './'

export class CardDeck {
    readonly deck: Card[];

    constructor(deck: Card[]) {
      this.deck = deck;
    }
}
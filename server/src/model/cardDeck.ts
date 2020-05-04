import { Card } from './'

export class CardDeck {
    readonly name: string;
    readonly cards: Card[];

    constructor(name: string, cards: Card[]) {
      this.name = name;
      this.cards = cards;
    }
}
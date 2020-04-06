export class Card {
    readonly value: number | undefined;
    readonly name: string;

    constructor(name: string, value: number | undefined) {
        this.name = name;
        this.value = value;
    }
}
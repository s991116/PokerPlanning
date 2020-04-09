export class Card {
    readonly value: number | undefined;
    readonly name: string;
    readonly disabled: boolean;

    constructor(name: string, value: number | undefined, disabled: boolean) {
        this.name = name;
        this.value = value;
        this.disabled = disabled;
    }
}
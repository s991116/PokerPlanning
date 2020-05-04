export class User {
  readonly _id: string;
  public name: string;
  readonly socketId: string;
  public cardIndex: number;
  public played: boolean;
  public isPlaying: boolean;
  public cardDeckName: string;

  constructor(id:string, name: string, socketId: string, cardDeckName: string) {
    this._id = id;
    this.name = name;
    this.socketId = socketId;
    this.cardIndex = 0;
    this.played = false;
    this.isPlaying = true;
    this.cardDeckName = cardDeckName;
  }
}
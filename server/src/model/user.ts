export class User {
  readonly id: string;
  readonly name: string;
  readonly socketId: string;
  public cardIndex: number;
  public played: boolean;
  public isPlaying: boolean;

  constructor(id:string, name: string, socketId: string) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.cardIndex = 1;
    this.played = false;
    this.isPlaying = true;
  }
}
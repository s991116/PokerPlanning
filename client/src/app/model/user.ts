export class User {
    readonly id: string;
    readonly name: string;
    readonly socketId: string;
    public card: number;
    public played: boolean;
  
    constructor(id:string, name: string, socketId: string) {
      this.id = id;
      this.name = name;
      this.socketId = socketId;
      this.card = 0;
      this.played = false;
    }
  }
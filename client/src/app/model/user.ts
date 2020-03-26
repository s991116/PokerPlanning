export class User {
    readonly id: string;
    readonly name: string;
    readonly socketId: string;
  
    constructor(id:string, name: string, socketId: string) {
      this.id = id;
      this.name = name;
      this.socketId = socketId;
    }
  }
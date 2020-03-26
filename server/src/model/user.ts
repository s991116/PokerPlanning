import { v4 as uuidv4 } from "uuid";

export class User {
  readonly id: string;
  readonly name: string;
  readonly socketId: string;

  constructor(name: string, socketId: string) {
    this.id = uuidv4();
    this.name = name;
    this.socketId = socketId;
  }
}
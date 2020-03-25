import { v4 as uuidv4 } from "uuid";

export class User {
  readonly id: string;
  readonly name: string;
  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}
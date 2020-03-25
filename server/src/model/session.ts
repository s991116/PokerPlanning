import { User } from './'
import { v4 as uuidv4 } from "uuid";

export class Session {
    readonly id: string;
    public users: User[];
    constructor(private name: string) {
        this.id = uuidv4();
        this.users = <User[]>[]
    }
}
import { User } from './'

export class Session {
    readonly id: string;
    readonly name: string;
    public users: User[];
    
    constructor(id:string, name: string) {
        this.id = id;
        this.name = name;
        this.users = <User[]>[];
    }
}

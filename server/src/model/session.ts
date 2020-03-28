import { User, VotingState } from './'

export class Session {
    readonly id: string;
    readonly name: string;
    public users: User[];
    public state: VotingState;
    constructor(id:string, name: string) {
        this.id = id;
        this.name = name;
        this.users = <User[]>[]
        this.state = VotingState.WaitingToVote;
    }
}
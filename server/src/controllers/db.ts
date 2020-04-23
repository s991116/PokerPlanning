import { connect, connection, Connection } from 'mongoose';
import { SessionModel, SessionSchema } from './../model/sessionModel';
import { UserModel, UserSchema } from './../model/userModel';
declare interface IModels {
    Session: SessionModel;
    User: UserModel;
}

export class DB {

    private static instance: DB;
    
    private _db: Connection; 
    private _models: IModels;

    private constructor() {
        let connectionString: string = process.env.dbConnection || "mongodb://localhost:27017/PokerPlanning";
        connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});
        this._db = connection;
        this._db.on('open', this.connected);
        this._db.on('error', this.error);

        this._models = {
            Session: new SessionSchema().model,
            User: new UserSchema().model,
            // this is where we initialise all models
        }
    }

    public static get Models() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance._models;
    }

    private connected() {
        console.log('Mongoose has connected');
    }

    private error(error:any) {
        console.log('Mongoose has errored', error);
    }
}
import { connect, connection, Connection } from 'mongoose';
import { SessionModel, SessionSchema } from './../model/sessionModel';

declare interface IModels {
    Session: SessionModel;
}

export class DB {

    private static instance: DB;
    
    private _db: Connection; 
    private _models: IModels;

    private constructor() {
        let connectionString: string = process.env.dbConnection || "mongodb://localhost:27017/PokerPlanning";
        connect(connectionString);
        this._db = connection;
        this._db.on('open', this.connected);
        this._db.on('error', this.error);

        this._models = {
            Session: new SessionSchema().model
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
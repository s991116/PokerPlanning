import { VotingState } from "./VotingState";
import { Schema, model, Document, Model } from "mongoose";

declare interface ISession extends Document {
  _id: {
    type: String;
  };
  name: {
    type: String;
  };
  votingState: {
    type: String;
  };
  users: [
    {
      type: Schema.Types.ObjectId;
      ref: "User";
    }
  ];
  created_date: {
    type: Date;
  };
}

export interface SessionModel extends Model<ISession> {};

export class SessionSchema {

  private _model: Model<ISession>;

  constructor() {
      const schema =  new Schema({
          _id: { type: String, required: true},
          name: { type: String, required: true },
          votingState: {type: String, required: true, enum: Object.values(VotingState)},
          users: [
            {
              type: Schema.Types.ObjectId,
              ref: "User",
            },
          ],
          creation_date: { type: Date, default: Date.now }
      });

      this._model = model<ISession>('Session', schema);
  }

  public get model(): Model<ISession> {
      return this._model
  }
}
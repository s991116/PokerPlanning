import { Schema, model, Document, Model } from "mongoose";

declare interface IUser extends Document {
  _id: {
    type: String;
  };
  name: {
    type: String;
  };
  socketId: {
    type: String;
  };
  card: {
    type: Number;
    default: 0;
  };
  played: {
    type: Boolean;
    default: false;
  };
  isPlaying: {
    type: Boolean;
  };
}

export interface UserModel extends Model<IUser> {}

export class UserSchema {
  private _model: Model<IUser>;

  constructor() {
    const schema = new Schema({
      _id: { type: String, required: true },
      name: { type: String, required: true },
      socketId: { type: String },
      card: { type: Number, default: 0 },
      played: { type: Boolean, default: false },
      isPlaying: { type: Boolean },
    });

    this._model = model<IUser>("User", schema);
  }

  public get model(): Model<IUser> {
    return this._model;
  }
}

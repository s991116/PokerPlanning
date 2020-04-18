import * as mongoose from "mongoose";
import { VotingState } from "./VotingState";

const Schema = mongoose.Schema;

export const SessionSchema = new Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
  },
  votingState: {
    type: String,
    enum: Object.values(VotingState),
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  created_date: {
    type: Date,
    default: Date.now,
  },
});

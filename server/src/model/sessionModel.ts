import * as mongoose from 'mongoose';
import { VotingState } from './VotingState';

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
    created_date: {
        type: Date,
        default: Date.now
    }
});
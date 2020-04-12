import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const SessionSchema = new Schema({
    _id: {
        type: String,
    },
    name: {
        type: String,
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});
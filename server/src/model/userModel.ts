import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const SessionSchema = new Schema({
    id: {
        type: String,
    },
    name: {
        type: String            
    },
    socketId: {
        type: String            
    },
    card: {
        type: Number,
        default: 0          
    },
    played: {
        type: Boolean,
        default: false
    }
});
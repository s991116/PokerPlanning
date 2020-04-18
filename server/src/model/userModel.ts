import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const SessionSchema = new Schema({
    _id: {
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
    },
    isPlaying: {
        type: Boolean
    },
});

module.exports = mongoose.model("User", SessionSchema);
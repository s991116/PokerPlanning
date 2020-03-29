import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const SessionSchema = new Schema({
    id: {
        type: String,
    },
    /*
    users: {
        type: ,
    },
    */
    state: {
        type: Number            
    },
    company: {
        type: String            
    },
    phone: {
        type: Number            
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});
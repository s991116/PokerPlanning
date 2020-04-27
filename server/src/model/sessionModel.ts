import { createSchema, Type, typedModel, ExtractProps } from 'ts-mongoose';
import { VotingState } from './VotingState';
import { UserSchema } from './userModel';

export class SessionSchema {
  private userSchema = new UserSchema();  
  
  readonly Schema = createSchema({
      name: Type.string({required: true}),
      state: Type.string({ required: true}),
      creation_date: Type.date({ default: Date.now as any}),
      users: Type.array( {required: true}).of(this.userSchema.Schema)
    });
    
    readonly Model = typedModel('Session', this.Schema);    
}
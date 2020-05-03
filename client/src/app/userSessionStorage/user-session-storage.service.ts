import { Injectable } from '@angular/core';
import { Inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

import { SESSION_STORAGE, StorageService } from "ngx-webstorage-service";
import { User } from '../model';

const USERNAME_SESSION_KEY = "UserInfo";
const SESSION_KEY = "SessionInfo";

@Injectable({
  providedIn: 'root'
})
export class UserSessionStorageService {

  private _userDefined: boolean;
  private _sessionId: string;

  constructor(
    @Inject(SESSION_STORAGE) private storage: StorageService,
    private httpClient: HttpClient,
  ) { }

  newSession(sessionId: any) {
    this.storage.remove(USERNAME_SESSION_KEY);
    this.storage.set(SESSION_KEY, sessionId);
  }
  newSessionLoad(sessionId: string): void {
    let sessionStorrageDefined = this.storage.has(SESSION_KEY) && this.storage.get(SESSION_KEY) !== undefined;

    if (sessionStorrageDefined) {
      let sId = this.storage.get(SESSION_KEY).sessionId;
      if (sId !== sessionId) {
        this.storage.set(SESSION_KEY, { sessionId: sessionId });
        this.storage.remove(USERNAME_SESSION_KEY);
        this._sessionId = sessionId;
      }
    }
    else {
      this.storage.set(SESSION_KEY, { sessionId: this._sessionId });
      this.storage.remove(USERNAME_SESSION_KEY);
      this._sessionId = sessionId;
    } 
  }

  async userExists() {
    if(this.storage.has(USERNAME_SESSION_KEY) && this.storage.has(SESSION_KEY)) {
      let storageUser: User = this.storage.get(USERNAME_SESSION_KEY);
      let sessionId = this.storage.get(SESSION_KEY).sessionId;
      let userExists = await this.httpClient.get<boolean>("/userExists", {params: {sessionId: sessionId, userId: storageUser._id}}).toPromise();
      if(!userExists) {
        this.storage.remove(USERNAME_SESSION_KEY);        
      }
      return userExists;
    }
    else
    {
      return false;
    }
  }

  setUser(user:User): void {
    this.storage.set(USERNAME_SESSION_KEY, user);
  }

  getUser(): User {
    return this.storage.get(USERNAME_SESSION_KEY);
  }

}

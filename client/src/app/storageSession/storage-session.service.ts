import { Injectable } from "@angular/core";
import { SESSION_STORAGE, StorageService } from "ngx-webstorage-service";
import { Inject } from "@angular/core";
import { User, Session } from "../model/index";

@Injectable({
  providedIn: "root",
})
export class StorageSessionService {
  constructor(@Inject(SESSION_STORAGE) private storage: StorageService) {}

  private SessionStorageName = "SessionPokerPlanningV1";
  private UserStorageName = "UserPokerPlanningV1";

  SetSession(session: Session) {
    this.storage.set(this.SessionStorageName, session);
  }

  SetUser(user: User) {
    this.storage.set(this.UserStorageName, user);
  }

  GetUser(): User {
    if (this.storage.has(this.UserStorageName))
      return this.storage.get(this.UserStorageName) as User;
    else return undefined;
  }

  GetSession(): Session {
    if (this.storage.has(this.SessionStorageName))
      return this.storage.get(this.SessionStorageName) as Session;
    else return undefined;
  }
}

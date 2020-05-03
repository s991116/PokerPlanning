import { TestBed } from '@angular/core/testing';

import { UserSessionStorageService } from './user-session-storage.service';

describe('UserSessionStorageService', () => {
  let service: UserSessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

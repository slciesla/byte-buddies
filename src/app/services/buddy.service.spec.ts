import { TestBed, inject } from '@angular/core/testing';

import { BuddyService } from './buddy.service';

describe('BuddyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuddyService]
    });
  });

  it('should ...', inject([BuddyService], (service: BuddyService) => {
    expect(service).toBeTruthy();
  }));
});

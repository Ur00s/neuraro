import { TestBed } from '@angular/core/testing';

import { GooglesigninService } from './googlesignin.service';

describe('GooglesigninService', () => {
  let service: GooglesigninService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GooglesigninService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

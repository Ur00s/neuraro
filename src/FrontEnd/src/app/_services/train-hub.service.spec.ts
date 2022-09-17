import { TestBed } from '@angular/core/testing';

import { TrainHubService } from './train-hub.service';

describe('TrainHubService', () => {
  let service: TrainHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

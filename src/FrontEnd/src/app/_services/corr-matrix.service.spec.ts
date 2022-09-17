import { TestBed } from '@angular/core/testing';

import { CorrMatrixService } from './corr-matrix.service';

describe('CorrMatrixService', () => {
  let service: CorrMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorrMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

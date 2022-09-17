import { TestBed } from '@angular/core/testing';

import { FileChangesService } from './file-changes.service';

describe('FileChangesService', () => {
  let service: FileChangesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileChangesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ChatbothubService } from './chatbothub.service';

describe('ChatbothubService', () => {
  let service: ChatbothubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbothubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

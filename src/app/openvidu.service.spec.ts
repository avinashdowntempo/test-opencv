import { TestBed } from '@angular/core/testing';

import { OpenviduService } from './openvidu.service';

describe('OpenviduService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenviduService = TestBed.get(OpenviduService);
    expect(service).toBeTruthy();
  });
});

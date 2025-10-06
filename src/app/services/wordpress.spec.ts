import { TestBed } from '@angular/core/testing';

import { Wordpress } from './wordpress';

describe('Wordpress', () => {
  let service: Wordpress;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Wordpress);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

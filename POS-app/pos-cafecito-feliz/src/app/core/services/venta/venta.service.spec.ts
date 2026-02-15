import { TestBed } from '@angular/core/testing';

import { VentaService } from './venta.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VentaService', () => {
  let service: VentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(VentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

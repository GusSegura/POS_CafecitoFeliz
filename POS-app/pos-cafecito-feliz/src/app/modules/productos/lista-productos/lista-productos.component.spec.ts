import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { ListaProductosComponent } from './lista-productos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const toastrMock = {
  success: jasmine.createSpy('success'),
  error: jasmine.createSpy('error'),
  warning: jasmine.createSpy('warning'),
  info: jasmine.createSpy('info')
};

describe('ListaProductosComponent', () => {
  let component: ListaProductosComponent;
  let fixture: ComponentFixture<ListaProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaProductosComponent, HttpClientTestingModule],
      providers: [
  { provide: ToastrService, useValue: toastrMock }
]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

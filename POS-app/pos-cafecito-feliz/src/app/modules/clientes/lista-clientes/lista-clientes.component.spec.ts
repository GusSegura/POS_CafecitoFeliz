import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { ListaClientesComponent } from './lista-clientes.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ListaClientesComponent', () => {
  let component: ListaClientesComponent;
  let fixture: ComponentFixture<ListaClientesComponent>;

  const toastrMock = {
  success: jasmine.createSpy('success'),
  error: jasmine.createSpy('error'),
  warning: jasmine.createSpy('warning'),
  info: jasmine.createSpy('info')
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaClientesComponent, HttpClientTestingModule],
      providers: [
  { provide: ToastrService, useValue: toastrMock }
]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

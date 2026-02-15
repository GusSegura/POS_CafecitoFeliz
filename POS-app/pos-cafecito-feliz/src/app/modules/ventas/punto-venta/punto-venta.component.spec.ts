import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuntoVentaComponent } from './punto-venta.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductoService } from '../../../core/services/producto/producto.service';
import { ClienteService } from '../../../core/services/cliente/cliente.service';
import { VentaService } from '../../../core/services/venta/venta.service';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';


const productoServiceMock = {
  getProductos: () => of([])
};

const clienteServiceMock = {
  getClientes: () => of([])
};

const ventaServiceMock = {
  crearVenta: () => of({ venta: {} })
};

const dashboardServiceMock = {
  getEstadisticas: () => of({ estadisticas: {} })
};

const toastrMock = {
  success: jasmine.createSpy('success'),
  error: jasmine.createSpy('error'),
  warning: jasmine.createSpy('warning'),
  info: jasmine.createSpy('info')
};

describe('PuntoVentaComponent', () => {
  let component: PuntoVentaComponent;
  let fixture: ComponentFixture<PuntoVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuntoVentaComponent, HttpClientTestingModule],
      providers: [
  { provide: ProductoService, useValue: productoServiceMock },
  { provide: ClienteService, useValue: clienteServiceMock },
  { provide: VentaService, useValue: ventaServiceMock },
  { provide: DashboardService, useValue: dashboardServiceMock },
  { provide: ToastrService, useValue: toastrMock }
]
    }).compileComponents();

    fixture = TestBed.createComponent(PuntoVentaComponent);
    component = fixture.componentInstance;

    
    fixture.detectChanges();
  });

  // -------------------------------
  // PRUEBA BASE
  // -------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------
  // DESCUENTOS
  // -------------------------------
  it('calcula descuento según compras previas', () => {
    expect(component.calcularDescuento(0)).toBe(0);
    expect(component.calcularDescuento(2)).toBe(5);
    expect(component.calcularDescuento(5)).toBe(10);
    expect(component.calcularDescuento(10)).toBe(15);
  });

  // -------------------------------
  // SUBTOTAL
  // -------------------------------
  it('calcula subtotal correctamente', () => {
    component.carrito = [
      { producto: { precio: 50 }, cantidad: 2 } as any,
      { producto: { precio: 30 }, cantidad: 1 } as any
    ];

    expect(component.subtotal).toBe(130);
  });

  // -------------------------------
  // TOTAL CON DESCUENTO
  // -------------------------------
  it('calcula total aplicando descuento', () => {
    component.carrito = [
      { producto: { precio: 100 }, cantidad: 1 } as any
    ];

    component.clienteSeleccionado = { purchasesCount: 5 } as any;

    expect(component.descuento).toBe(10);
    expect(component.montoDescuento).toBe(10);
    expect(component.total).toBe(90);
  });

  // -------------------------------
  // AGREGAR AL CARRITO
  // -------------------------------
  it('agrega producto nuevo al carrito', () => {
    const producto = { _id: '1', precio: 50, stock: 10 };

    component.carrito = [];
    component.agregarAlCarrito(producto as any);

    expect(component.carrito.length).toBe(1);
    expect(component.carrito[0].cantidad).toBe(1);
  });

  // -------------------------------
  // SI YA EXISTE → SUMA CANTIDAD
  // -------------------------------
  it('incrementa cantidad si el producto ya estaba', () => {
    const producto = { _id: '1', precio: 50, stock: 10 };

    component.carrito = [];
    component.agregarAlCarrito(producto as any);
    component.agregarAlCarrito(producto as any);

    expect(component.carrito[0].cantidad).toBe(2);
  });

  // -------------------------------
  // DECREMENTAR Y ELIMINAR
  // -------------------------------
  it('elimina producto si cantidad llega a 0', () => {
    const producto = { _id: '1', precio: 50 };

    component.carrito = [
      { producto, cantidad: 1 } as any
    ];

    component.decrementar(component.carrito[0]);

    expect(component.carrito.length).toBe(0);
  });

  // -------------------------------
  // FILTRO POR CATEGORÍA
  // -------------------------------
  it('filtra productos por categoría', () => {
    component.productos = [
      { categoria: 'cafe' },
      { categoria: 'postre' }
    ] as any;

    component.filtrarPorCategoria('cafe');

    expect(component.productosFiltrados.length).toBe(1);
  });

});

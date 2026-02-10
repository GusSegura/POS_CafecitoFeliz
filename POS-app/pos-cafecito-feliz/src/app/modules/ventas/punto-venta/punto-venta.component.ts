import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { ProductoService } from '../../../core/services/producto/producto.service';
import { ClienteService } from '../../../core/services/cliente/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { VentaService } from '../../../core/services/venta/venta.service';


interface CartItem {
  producto: any; 
  cantidad: number;
}

@Component({
  selector: 'app-punto-venta',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.css']
})
export class PuntoVentaComponent implements OnInit {
  
  
  productos: any[] = [];
  productosFiltrados: any[] = [];
  carrito: CartItem[] = []; 
  

  busquedaCliente: string = '';
  clienteSeleccionado: any = null;
  todosLosClientes: any[] = []; 

  categoriaActual: string = 'todos';

  constructor(
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarClientes();
  }


  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {

        this.productos = res.productos || res; 
        this.productosFiltrados = this.productos;
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (res: any) => {
        this.todosLosClientes = res.clientes || res; 
      },
      error: (err) => console.error('Error cargando clientes', err)
    });
  }



  agregarAlCarrito(producto: any) {
    if (producto.stock === 0) return;

    const itemExistente = this.carrito.find(item => item.producto._id === producto._id);

    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
      } else {
        alert('No hay suficiente stock');
      }
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  incrementar(item: CartItem) {
    if (item.cantidad < item.producto.stock) {
      item.cantidad++;
    }
  }

  decrementar(item: CartItem) {
    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      // Eliminar del carrito si baja a 0
      this.carrito = this.carrito.filter(i => i.producto._id !== item.producto._id);
    }
  }



  buscarCliente() {
    if (!this.busquedaCliente.trim()) {
      this.clienteSeleccionado = null;
      return;
    }
    // Filtrado simple por nombre
    const termino = this.busquedaCliente.toLowerCase();
    const encontrado = this.todosLosClientes.find((c: any) => 
      c.nombre.toLowerCase().includes(termino) || 
      c.email.toLowerCase().includes(termino)
    );

    if (encontrado) {
      this.clienteSeleccionado = encontrado;
      // Limpia el input
      this.busquedaCliente = ''; 
    } else {
      alert('Cliente no encontrado');
    }
  }

 
  calcularDescuento(comprasPrevias: number): number {
    if (!comprasPrevias || comprasPrevias === 0) return 0;
    if (comprasPrevias >= 1 && comprasPrevias <= 3) return 5;
    if (comprasPrevias >= 4 && comprasPrevias <= 7) return 10;
    if (comprasPrevias >= 8) return 15;
    return 0;
  }

  // --- GETTERS (CÁLCULOS AUTOMÁTICOS) ---
  
  get subtotal(): number {
    return this.carrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  get descuento(): number {
    if (!this.clienteSeleccionado) return 0;
    return this.calcularDescuento(this.clienteSeleccionado.purchasesCount || 0);
  }

  get montoDescuento(): number {
    return this.subtotal * (this.descuento / 100);
  }

  get total(): number {
    return this.subtotal - this.montoDescuento;
  }

  // --- AYUDAS VISUALES ---

  getImageUrl(imagenPath: string): string {

    if (!imagenPath) return 'http://localhost:3000/uploads/productos/default-producto.png';
    return imagenPath.startsWith('http') ? imagenPath : `http://localhost:3000${imagenPath}`;
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger fw-bold';
    if (stock <= 5) return 'text-warning fw-bold';
    return 'text-success';
  }

  filtrarPorCategoria(categoria: string) {
  this.categoriaActual = categoria;
  
  if (categoria === 'todos') {
    this.productosFiltrados = this.productos;
  } else {
    this.productosFiltrados = this.productos.filter(p => p.categoria === categoria);
  }
}

procesarVenta() {

  if (this.carrito.length === 0) {
    this.toastr.warning('El carrito está vacío', 'Atención');
    return;
  }

  // para que el backend reciba solo IDs y cantidades
const detalles = this.carrito.map(item => ({
    productoId: item.producto._id, 
    cantidad: item.cantidad,
    precioUnitario: item.producto.precio
  }));

  const ventaData = {
    clienteId: this.clienteSeleccionado ? this.clienteSeleccionado._id : null,
    productos: detalles,
    metodoPago: 'efectivo',
    subtotal: this.subtotal,
    descuento: this.montoDescuento,
    total: this.total
  };

  // Llamada al Backend
  this.ventaService.crearVenta(ventaData).subscribe({
    next: (res) => {
      const msg = this.clienteSeleccionado 
      ? `Registrada a: ${this.clienteSeleccionado.nombre}` 
      : 'A Público General';


    this.toastr.success(msg, '¡Venta Exitosa!');

    // Limpiamos
    this.limpiarCarrito(); 
    this.cargarProductos();
    this.cargarClientes();     

    },
    error: (err) => {
      console.error('Detalle del error del servidor:', err.error);
      this.toastr.error(err.error?.error || 'Error al procesar la venta', 'Error');
    }
  });
}


limpiarCarrito() {
  this.carrito = [];
  this.clienteSeleccionado = null;
  this.busquedaCliente = '';
}

}
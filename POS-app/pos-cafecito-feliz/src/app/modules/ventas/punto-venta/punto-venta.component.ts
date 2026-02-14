import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { ProductoService } from '../../../core/services/producto/producto.service';
import { ClienteService } from '../../../core/services/cliente/cliente.service';
import { ToastrService } from 'ngx-toastr';
import { VentaService } from '../../../core/services/venta/venta.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';



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
  stats: any = {ingresosHoy: 0, ingresosMes: 0, ventasHoy: 0};

  busquedaCliente: string = '';
  clienteSeleccionado: any = null;
  todosLosClientes: any[] = []; 
  categoriaActual: string = 'todos';
  metodoPago: 'efectivo' | 'tarjeta' = 'efectivo';


  constructor(
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarClientes();
    this.cargarEstadisticas();
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
    // Filtrado por nombre
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

  // getters de calculos
  
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

  // AYUDAS VISUALES para el cliente

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
    metodoPago: this.metodoPago,
    subtotal: this.subtotal,
    descuento: this.montoDescuento,
    total: this.total
  };

  // Llamada al Backend
  this.ventaService.crearVenta(ventaData).subscribe({
    next: (res) => {
      this.imprimirTicket(res.venta);
      const msg = this.clienteSeleccionado 
      ? `Registrada a: ${this.clienteSeleccionado.nombre}` 
      : 'A Público General';


    this.toastr.success(msg, '¡Venta Exitosa!');

    // Limpiamos
    this.limpiarCarrito(); 
    this.cargarProductos();
    this.cargarClientes();
    this.cargarEstadisticas();   

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

cargarEstadisticas() {
  this.dashboardService.getEstadisticas().subscribe(res => {
    this.stats = res.estadisticas;
  });
}

getProgressPercentage(): number {
  if (!this.stats.ingresosMes) return 0;
  return Math.min(
    (this.stats.ingresosHoy / this.stats.ingresosMes) * 100,
    100
  );
}

imprimirTicket(venta: any) {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150] // impresora térmica 80mm
  });

  // Encabezado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CAFECITO FELIZ', 40, 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RFC: CAFE123456789', 40, 15, { align: 'center' });
  doc.text('Madero #347-B, Centro', 40, 19, { align: 'center' });
  doc.text('------------------------------------------', 40, 23, { align: 'center' });

  // Información de la Venta
  doc.setFontSize(9);

  doc.text(`Ticket: ${venta._id.substring(venta._id.length - 6).toUpperCase()}`, 5, 28);
  doc.text(`Fecha: ${new Date(venta.createdAt).toLocaleString()}`, 5, 33);

  const nombreCliente = venta.cliente ? venta.cliente.nombre : 'Público General';
  doc.text(`Cliente: ${nombreCliente}`, 5, 38);

  // Cajero que atendió
  const cajero = venta.usuario?.nombre || 'Sistema';
  doc.text(`Cajero: ${cajero}`, 5, 43);

  // Método de pago
  const metodo = (venta.metodoPago || 'efectivo').toUpperCase();
  doc.text(`Pago: ${metodo}`, 5, 48);

  doc.text('------------------------------------------', 40, 53, { align: 'center' });

  // Tabla de Productos
  autoTable(doc, {
    startY: 55,
    margin: { left: 5, right: 5 },
    theme: 'plain',
    head: [['Cant', 'Producto', 'Total']],
    body: venta.productos.map((p: any) => [
      p.cantidad,
      p.producto?.nombre || p.nombre,
      `$${p.subtotal.toFixed(2)}`
    ]),
    styles: { fontSize: 7, cellPadding: 1 },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY + 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.text(`Subtotal:`, 45, finalY);
  doc.text(`$${venta.subtotal.toFixed(2)}`, 75, finalY, { align: 'right' });

  if (venta.descuentoMonto > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text(`Desc. (${venta.descuentoPorcentaje}%):`, 45, finalY + 5);
    doc.text(`-$${venta.descuentoMonto.toFixed(2)}`, 75, finalY + 5, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL:`, 45, finalY + 12);
  doc.text(`$${venta.total.toFixed(2)}`, 75, finalY + 12, { align: 'right' });

  // Pie del ticket
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('¡Gracias por tu compra!', 40, finalY + 22, { align: 'center' });
  doc.text('¡Entre más compras, más descuentos!', 40, finalY + 26, { align: 'center' });

  // Abrir para imprimir
  doc.output('dataurlnewwindow');
}


seleccionarMetodo(metodo: 'efectivo' | 'tarjeta') {
  this.metodoPago = metodo;
}

}
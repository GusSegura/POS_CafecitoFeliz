import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ClienteService } from '../../core/services/cliente/cliente.service';
import { ProductoService } from '../../core/services/producto/producto.service';
import { StatsService } from '../../core/services/stats/stats.service';
import { Producto } from '../../core/types/Producto';
import { Venta } from '../../core/types/Venta';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  stats = {
    totalClientes: 0,
    totalProductos: 0,
    totalVentas: 0,
    ventasHoy: 0,
    ventasCanceladas: 0,
    totalIngresos: 0,
    ingresosHoy: 0,
    ingresosMes: 0,
    totalDescuentos: 0,
    descuentosHoy: 0,
    promedioVenta: 0
  };
  
  topProductos: any[] = [];
  productosStockBajo: any[] = [];
  ventas: Venta[] = [];
  loading = true;
  metaMensual = 15000;
  ventasEfectivo: number = 0;
  ventasTarjeta: number = 0;
  efectivoInicial = 1000;

  constructor(
    public authService: AuthService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private statsService: StatsService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats() {
    this.loading = true;

    // Cargar clientes
    this.clienteService.getClientes().subscribe({
      next: (res) => {
        this.stats.totalClientes = res.total || res.clientes?.length || 0;
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });

    // Cargar productos
    this.productoService.getProductos().subscribe({
      next: (res) => {
        this.stats.totalProductos = res.total || res.productos?.length || 0;
        
        // Filtrar productos con stock bajo
        this.productosStockBajo = (res.productos as Producto[])
          ?.filter(p => p.stock <= (p.stockMinimo || 10))
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5) || [];
      },
      error: (err) => console.error('Error cargando productos:', err)
    });

    // Cargar estadísticas de ventas
    this.statsService.getEstadisticas().subscribe({
      next: (res) => {
        if (res.success) {
          const est = res.estadisticas;
          this.stats.totalVentas = est.totalVentas || 0;
          this.stats.ventasHoy = est.ventasHoy || 0;
          this.stats.ventasCanceladas = est.ventasCanceladas || 0;
          this.stats.totalIngresos = parseFloat(est.totalIngresos) || 0;
          this.stats.ingresosHoy = parseFloat(est.ingresosHoy) || 0;
          this.stats.ingresosMes = parseFloat(est.ingresosMes) || 0;
          this.stats.totalDescuentos = parseFloat(est.totalDescuentos) || 0;
          this.stats.descuentosHoy = parseFloat(est.descuentosHoy) || 0;
          this.stats.promedioVenta = parseFloat(est.promedioVenta) || 0;          
          this.ventasEfectivo = parseFloat(est.ventasEfectivoHoy) || 0;
          this.ventasTarjeta = parseFloat(est.ventasTarjetaHoy) || 0;
        
        // Top productos
        this.topProductos = est.topProductos || [];
      }
      this.loading = false;
    },
    error: (err) => {
      console.error('Error cargando estadísticas:', err);
      this.loading = false;
    }
  });
}

  getProgressPercentage(): number {
  if (this.metaMensual === 0) return 0;

  return (this.stats.ingresosMes / this.metaMensual) * 100;
}

  getStockClass(producto: any): string {
    if (producto.stock === 0) return 'danger';
    if (producto.stock <= 5) return 'danger';
    if (producto.stock <= (producto.stockMinimo || 10)) return 'warning';
    return 'success';
  }

  get hayProductosSinStock(): boolean {
  return this.productosStockBajo.some(p => p.stock === 0);
}

get subtotalTotalVentas(): number {
  return this.ventas.reduce((acc, v) => acc + v.subtotal, 0);
}

get totalDescuentos(): number {
  return this.ventas.reduce((acc, v) => acc + v.descuento, 0);
}

get porcentajeDescuento(): number {
  const subtotal = this.subtotalTotalVentas;
  if (subtotal === 0) return 0;

  return (this.totalDescuentos / subtotal) * 100;
}

//  Función para convertir imagen a base64
private getBase64ImageFromURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };

    img.onerror = error => reject(error);
    img.src = url;
  });
}



async descargarReportePDF() {
  const doc = new jsPDF();

  const fecha = new Date().toLocaleDateString('es-MX');
  let y = 20;

  // TÍTULO
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Corte de Caja - Cafecito Feliz ', 105, y, { align: 'center' });

  y += 10;

  // FECHA
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${fecha}`, 14, y);

  y += 10;

  // LÍNEA
  doc.line(14, y, 196, y);
  y += 8;

  //dinero inicial
  doc.text(`Efectivo inicial: `, 14, y);
  doc.text(` $1,000.00`, 160, y, { align: 'right' });
  y += 8;

    // LÍNEA
  doc.line(14, y, 196, y);
  y += 8;

  // DATOS
  doc.setFontSize(12);

  doc.text(`Ingresos del día:`, 14, y);
  doc.text(`$${this.stats.ingresosHoy.toFixed(2)}`, 160, y, { align: 'right' });
  y += 8;

  // Efectivo y tarjeta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`   • Ventas en efectivo:`, 14, y);
  doc.text(`$${this.ventasEfectivo.toFixed(2)}`, 160, y, { align: 'right' });
  y += 6;

  doc.text(`   • Ventas con tarjeta:`, 14, y);
  doc.text(`$${this.ventasTarjeta.toFixed(2)}`, 160, y, { align: 'right' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Total ventas
  doc.text(`Ventas realizadas:`, 14, y);
  doc.text(`${this.stats.ventasHoy}`, 160, y, { align: 'right' });
  y += 8;

  // Descuentos solo del día
  doc.text(`Descuentos aplicados:`, 14, y);
  doc.text(`$${this.stats.descuentosHoy.toFixed(2)}`, 160, y, { align: 'right' });
  y += 10;

  // TOTAL NETO = Efectivo inicial + Ventas en efectivo
  const totalNeto = this.efectivoInicial + this.ventasEfectivo;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOTAL NETO EN CAJA:`, 14, y);
  doc.text(`$${totalNeto.toFixed(2)}`, 160, y, { align: 'right' });

  y += 8;
  
  // Info adicional
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`(Efectivo inicial + Ventas en efectivo)`, 14, y);

  y += 10;

  // MENSAJE FINAL
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Corte de caja Exitoso!!!', 105, y, { align: 'center' });

  const logo = await this.getBase64ImageFromURL('assets/img/cafecitosmile.png');

  doc.addImage(logo, 'PNG', 46, 14, 13, 8);

  // DESCARGA
  doc.save(`reporte-ventas-${fecha}.pdf`);
}
}
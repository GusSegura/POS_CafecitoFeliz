import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ClienteService } from '../../core/services/cliente/cliente.service';
import { ProductoService } from '../../core/services/producto/producto.service';
import { VentaService } from '../../core/services/venta/venta.service';

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
    ventasHoy: 0
  };
  loading = true;

  constructor(
    public authService: AuthService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private ventaService: VentaService
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
      },
      error: (err) => console.error('Error cargando productos:', err)
    });

    // Cargar ventas
    this.ventaService.getVentas().subscribe({
      next: (res) => {
        this.stats.totalVentas = res.total || res.ventas?.length || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando ventas:', err);
        this.loading = false;
      }
    });
  }
}
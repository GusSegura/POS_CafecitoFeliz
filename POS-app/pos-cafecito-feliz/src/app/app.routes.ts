import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ListaClientesComponent } from './modules/clientes/lista-clientes/lista-clientes.component';
import { ListaProductosComponent } from './modules/productos/lista-productos/lista-productos.component';
import { PuntoVentaComponent } from './modules/ventas/punto-venta/punto-venta.component';
import { authGuard } from './core/guards/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Rutas protegidas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'clientes',
    component: ListaClientesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'productos',
    component: ListaProductosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'ventas',
    component: PuntoVentaComponent,
    canActivate: [authGuard]
  },
  
  // Ruta 404
  { path: '**', redirectTo: '/login' }
];
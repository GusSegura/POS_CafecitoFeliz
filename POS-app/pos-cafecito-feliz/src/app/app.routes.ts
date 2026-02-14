import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ListaClientesComponent } from './modules/clientes/lista-clientes/lista-clientes.component';
import { ListaProductosComponent } from './modules/productos/lista-productos/lista-productos.component';
import { PuntoVentaComponent } from './modules/ventas/punto-venta/punto-venta.component';
import { authGuard } from './core/guards/auth/auth.guard';
import { roleGuard } from './core/guards/role/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] } // Solo admin
  },
  {
    path: 'ventas',
    loadComponent: () => import('./modules/ventas/punto-venta/punto-venta.component').then(m => m.PuntoVentaComponent),
    canActivate: [authGuard] // Todos los usuarios autenticados
  },
  {
    path: 'clientes',
    loadComponent: () => import('./modules/clientes/lista-clientes/lista-clientes.component').then(m => m.ListaClientesComponent),
    canActivate: [authGuard] // Todos los usuarios autenticados
  },
  {
    path: 'productos',
    loadComponent: () => import('./modules/productos/lista-productos/lista-productos.component').then(m => m.ListaProductosComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] } // Solo admin
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./modules/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] } // Solo admin
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
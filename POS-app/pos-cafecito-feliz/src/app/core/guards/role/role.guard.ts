import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { map } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  return authService.user$.pipe(
    map(user => {
      // Validación inicial
      if (!user || !user.role) {
        router.navigate(['/login']);
        return false;
      }

      // Si no hay roles requeridos, permite el acceso
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Verifica si el usuario tiene alguno de los roles requeridos
      const hasRole = requiredRoles.includes(user.role);

      if (!hasRole) {
        // Redirigir según el rol
        const redirectRoute = user.role === 'cajero' ? '/ventas' : '/dashboard';
        router.navigate([redirectRoute]);
        return false;
      }

      return true;
    })
  );
};
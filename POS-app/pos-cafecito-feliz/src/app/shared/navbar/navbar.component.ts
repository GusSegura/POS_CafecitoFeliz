import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'admin';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role === 'admin' ? 'Admin' : 'Cajero';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
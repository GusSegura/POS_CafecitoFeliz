import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.toastr.warning('Por favor completa todos los campos', 'Atención');
      return;
    }

    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.toastr.success('Bienvenido', 'Login exitoso');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(
          error.error?.error || 'Credenciales inválidas',
          'Error'
        );
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
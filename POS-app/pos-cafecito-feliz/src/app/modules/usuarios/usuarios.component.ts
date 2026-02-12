import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user/user.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editMode = false;
  showPassword = false;
  changePassword = false;
  
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  
  currentUserId: string = '';
  selectedUser: any = null;
  
  userForm!: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?._id || '';
    this.loadUsers();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['cajero', Validators.required],
      activo: [true]
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.loading = false;
        alert('Error al cargar usuarios');
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchSearch = !this.searchTerm || 
        user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchRole = !this.roleFilter || user.role === this.roleFilter;
      
      const matchStatus = !this.statusFilter || 
        user.activo.toString() === this.statusFilter;
      
      return matchSearch && matchRole && matchStatus;
    });
  }

  openModal(): void {
    this.editMode = false;
    this.changePassword = false;
    this.showPassword = false;
    this.selectedUser = null;
    this.userForm.reset({
      nombre: '',
      email: '',
      password: '',
      role: 'cajero',
      activo: true
    });
    
    // Hacer la contraseña obligatoria en modo crear
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  editUser(user: any): void {
    this.editMode = true;
    this.changePassword = false;
    this.showPassword = false;
    this.selectedUser = user;
    
    this.userForm.patchValue({
      nombre: user.nombre,
      email: user.email,
      role: user.role,
      activo: user.activo
    });
    
    // En modo editar, la contraseña no es obligatoria por defecto
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const userData = { ...this.userForm.value };

    // Si estamos editando y no se cambió la contraseña, eliminarla del objeto
    if (this.editMode && !this.changePassword) {
      delete userData.password;
    }

    // Si estamos editando y se marcó cambiar contraseña, validar que tenga valor
    if (this.editMode && this.changePassword) {
      if (!userData.password || userData.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        this.saving = false;
        return;
      }
    }

    const request = this.editMode
      ? this.userService.updateUser(this.selectedUser._id, userData)
      : this.userService.createUser(userData);

    request.subscribe({
      next: (res) => {
        this.saving = false;
        alert(res.message || 'Usuario guardado exitosamente');
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.saving = false;
        console.error('Error guardando usuario:', err);
        alert(err.error?.error || 'Error al guardar usuario');
      }
    });
  }

  confirmDelete(user: any): void {
    const confirmed = confirm(`¿Estás seguro de desactivar al usuario "${user.nombre}"?`);
    if (confirmed) {
      this.userService.deleteUser(user._id).subscribe({
        next: (res) => {
          alert(res.message || 'Usuario desactivado exitosamente');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error desactivando usuario:', err);
          alert('Error al desactivar usuario');
        }
      });
    }
  }

  activateUserConfirm(user: any): void {
    const confirmed = confirm(`¿Deseas activar al usuario "${user.nombre}"?`);
    if (confirmed) {
      this.userService.activateUser(user._id).subscribe({
        next: (res) => {
          alert(res.message || 'Usuario activado exitosamente');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error activando usuario:', err);
          alert('Error al activar usuario');
        }
      });
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente/cliente.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css']
})
export class ListaClientesComponent implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  searchTerm = '';
  loading = true;
  
  // Modal
  showModal = false;
  editMode = false;
  currentClienteId: string | null = null;
  
  clienteForm = {
    nombre: '',
    email: '',
    telefono: ''
  };

  constructor(
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading = true;
    this.clienteService.getClientes().subscribe({
      next: (response) => {
        this.clientes = response.clientes || [];
        this.clientesFiltrados = [...this.clientes];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.toastr.error('Error al cargar clientes', 'Error');
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      cliente.telefono?.includes(term)
    );
  }

  getDescuento(purchasesCount: number): number {
    if (purchasesCount === 0) return 0;
    if (purchasesCount >= 1 && purchasesCount <= 3) return 5;
    if (purchasesCount >= 4 && purchasesCount <= 7) return 10;
    if (purchasesCount >= 8) return 15;
    return 0;
  }

  // Clase del badge según nivel
  getBadgeClass(purchasesCount: number): string {
    const descuento = this.getDescuento(purchasesCount);
    if (descuento === 0) return 'bg-secondary';
    if (descuento === 5) return 'bg-info';
    if (descuento === 10) return 'bg-warning';
    if (descuento === 15) return 'bg-success';
    return 'bg-secondary';
  }

  // Abrir modal para nuevo cliente
  openNewClienteModal() {
    this.editMode = false;
    this.currentClienteId = null;
    this.clienteForm = {
      nombre: '',
      email: '',
      telefono: ''
    };
    this.showModal = true;
  }

  // Abrir modal para editar
  openEditModal(cliente: any) {
    this.editMode = true;
    this.currentClienteId = cliente._id;
    this.clienteForm = {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono || ''
    };
    this.showModal = true;
  }


  closeModal() {
    this.showModal = false;
    this.clienteForm = {
      nombre: '',
      email: '',
      telefono: ''
    };
  }


  saveCliente() {
    // Validaciones
    if (!this.clienteForm.nombre.trim()) {
      this.toastr.warning('El nombre es obligatorio', 'Atención');
      return;
    }

    if (!this.clienteForm.email.trim()) {
      this.toastr.warning('El email es obligatorio', 'Atención');
      return;
    }

    if (this.editMode && this.currentClienteId) {
      // Actualizar
      this.clienteService.actualizarCliente(this.currentClienteId, this.clienteForm).subscribe({
        next: (response) => {
          this.toastr.success('Cliente actualizado correctamente');
          this.loadClientes();
          this.closeModal();
        },
        error: (error) => {
          this.toastr.error(error.error?.error || 'Error al actualizar cliente', 'Error');
        }
      });
    } else {
      // Crear
      this.clienteService.crearCliente(this.clienteForm).subscribe({
        next: (response) => {
          this.toastr.success('Cliente registrado correctamente');
          this.loadClientes();
          this.closeModal();
        },
        error: (error) => {
          this.toastr.error(error.error?.error || 'Error al crear cliente', 'Error');
        }
      });
    }
  }

  // Eliminar cliente
  deleteCliente(cliente: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el cliente: ${cliente.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.eliminarCliente(cliente._id).subscribe({
          next: () => {
            this.toastr.success('Cliente eliminado correctamente');
            this.loadClientes();
          },
          error: (error) => {
            this.toastr.error('Error al eliminar cliente', 'Error');
          }
        });
      }
    });
  }
}
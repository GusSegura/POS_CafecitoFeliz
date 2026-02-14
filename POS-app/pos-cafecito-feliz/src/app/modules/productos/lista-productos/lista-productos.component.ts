import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto/producto.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.css']
})
export class ListaProductosComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  searchTerm = '';
  loading = true;
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Filtros
  filterCategory = '';
  filterStock = 'all';
  
  // Modal
  showModal = false;
  editMode = false;
  currentProductoId: string | null = null;
  
  productoForm = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: 'bebida'
  };

  categorias = [
    { value: 'café', label: 'Cafés' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'alimento', label: 'Alimentos' },
    { value: 'postre', label: 'Postres' },
    { value: 'otro', label: 'Otros' }
  ];

  constructor(
    private productoService: ProductoService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.loading = true;
    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos = response.productos || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.toastr.error('Error al cargar productos', 'Error');
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.productos];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
      );
    }

    if (this.filterCategory) {
      filtered = filtered.filter(p => p.categoria === this.filterCategory);
    }

    if (this.filterStock === 'low') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
    } else if (this.filterStock === 'out') {
      filtered = filtered.filter(p => p.stock === 0);
    }

    this.productosFiltrados = filtered;
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger';
    if (stock <= 10) return 'text-warning';
    return 'text-success';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return 'bi-x-circle-fill';
    if (stock <= 10) return 'bi-exclamation-triangle-fill';
    return 'bi-check-circle-fill';
  }

  getCategoryLabel(value: string): string {
    const cat = this.categorias.find(c => c.value === value);
    return cat ? cat.label : value;
  }

  openNewProductoModal() {
    this.editMode = false;
    this.currentProductoId = null;
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: 'café'
    };
    this.selectedFile = null; // Limpia archivo
    this.imagePreview = null; // Limpia vista previa
    this.showModal = true;
  }

  openEditModal(producto: any) {
    this.editMode = true;
    this.currentProductoId = producto._id;
    this.productoForm = {
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria
    };
    this.selectedFile = null; //  Limpia archivo
    this.imagePreview = this.getImageUrl(producto.imagen); //  Muestra imagen actual
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: 'bebida'
    };
    this.selectedFile = null; //  Limpia archivo
    this.imagePreview = null; //  Limpia vista previa    
  }


onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Valida tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Solo se permiten imágenes', 'Error');
        return;
      }

      // Valida tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('La imagen no debe superar 5MB', 'Error');
        return;
      }

      this.selectedFile = file;

      // Genera vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

 removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveProducto() {
    if (!this.productoForm.nombre.trim()) {
      this.toastr.warning('El nombre es obligatorio', 'Atención');
      return;
    }

    if (this.productoForm.precio <= 0) {
      this.toastr.warning('El precio debe ser mayor a 0', 'Atención');
      return;
    }

    if (this.productoForm.stock < 0) {
      this.toastr.warning('El stock no puede ser negativo', 'Atención');
      return;
    }

     // Crea FormData para enviar archivo
    const formData = new FormData();
    formData.append('nombre', this.productoForm.nombre);
    formData.append('descripcion', this.productoForm.descripcion);
    formData.append('precio', this.productoForm.precio.toString());
    formData.append('stock', this.productoForm.stock.toString());
    formData.append('categoria', this.productoForm.categoria);

    // Agrega imagen si se seleccionó
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }


if (this.editMode && this.currentProductoId) {
  const formData = new FormData();
  
  formData.append('nombre', this.productoForm.nombre);
  formData.append('descripcion', this.productoForm.descripcion || '');
  formData.append('precio', this.productoForm.precio.toString());
  formData.append('stock', this.productoForm.stock.toString());
  formData.append('categoria', this.productoForm.categoria);
  
  // añadimos imagen si el usuario seleccionó una nueva
  if (this.selectedFile) {
    formData.append('imagen', this.selectedFile);
  }

  this.productoService.actualizarProducto(this.currentProductoId, formData).subscribe({
    next: (response) => {
      this.toastr.success('Producto actualizado correctamente', 'Éxito');
      this.loadProductos();
      this.closeModal();
      this.selectedFile = null; 
    },
    error: (error) => {
      this.toastr.error(error.error?.error || 'Error al actualizar producto', 'Error');
    }
  });
} else {
      this.productoService.crearProducto(formData).subscribe({
        next: (response) => {
          this.toastr.success('Producto registrado correctamente', 'Éxito');
          this.loadProductos();
          this.closeModal();
        },
        error: (error) => {
          this.toastr.error(error.error?.error || 'Error al crear producto', 'Error');
        }
      });
    }
  }

   // Obtiene URL completa de imagen
  getImageUrl(imagen: string): string {
    if (!imagen) {
      return 'http://localhost:3000/uploads/productos/default-producto.png';
    }
    
    // Si ya es una URL completa
    if (imagen.startsWith('http')) {
      return imagen;
    }
    
    // Si es una ruta relativa, agregar el dominio del backend
    return `${environment.apiUrl.replace('/api', '')}${imagen}`;
  }

  deleteProducto(producto: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el producto: ${producto.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(producto._id).subscribe({
          next: () => {
            this.toastr.success('Producto eliminado correctamente', 'Éxito');
            this.loadProductos();
          },
          error: (error) => {
            this.toastr.error('Error al eliminar producto', 'Error');
          }
        });
      }
    });
  }

  adjustStock(producto: any, amount: number) {
    const newStock = producto.stock + amount;
    
    if (newStock < 0) {
      this.toastr.warning('El stock no puede ser negativo', 'Atención');
      return;
    }

    this.productoService.actualizarProducto(producto._id, { stock: newStock }).subscribe({
      next: () => {
        this.toastr.success(`Stock actualizado: ${newStock}`, 'Éxito');
        this.loadProductos();
      },
      error: (error) => {
        this.toastr.error('Error al actualizar stock', 'Error');
      }
    });
  }

  handleImageError(event: any) {
    const defaultImg = 'http://localhost:3000/uploads/productos/default-producto.png';
    
    
    if (event.target.src !== defaultImg) {
        event.target.src = defaultImg;
    }
}

  // Getters para los filtros
  get productosSinStock(): any[] {
    return this.productos.filter(p => p.stock === 0);
  }

  get productosStockBajo(): any[] {
    return this.productos.filter(p => p.stock > 0 && p.stock <= 10);
  }
}
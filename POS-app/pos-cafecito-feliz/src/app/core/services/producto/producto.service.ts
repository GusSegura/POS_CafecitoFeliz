import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = `${environment.BACK_URL}productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getProductoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  crearProducto(productoData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, productoData);
  }

  actualizarProducto(id: string, productoData: FormData | any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, productoData);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
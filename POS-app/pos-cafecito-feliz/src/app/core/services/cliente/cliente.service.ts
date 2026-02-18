import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = `${environment.BACK_URL}clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getClienteById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post(this.baseUrl, cliente);
  }

  actualizarCliente(id: string, cliente: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, cliente);
  }

  eliminarCliente(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
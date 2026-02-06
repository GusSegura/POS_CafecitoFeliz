import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getClienteById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }

  actualizarCliente(id: string, cliente: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cliente);
  }

  eliminarCliente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
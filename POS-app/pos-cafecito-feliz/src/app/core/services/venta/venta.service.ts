import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  getVentas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getVentaById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  cancelarVenta(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancelar`, {});
  }

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }
}
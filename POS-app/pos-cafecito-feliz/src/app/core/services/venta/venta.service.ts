import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private baseUrl = `${environment.BACK_URL}/ventas`;

  constructor(private http: HttpClient) {}

  getVentas(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getVentaById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.baseUrl, venta);
  }

  cancelarVenta(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/cancelar`, {});
  }

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estadisticas`);
  }
}
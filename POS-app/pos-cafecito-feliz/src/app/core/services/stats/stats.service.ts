import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private baseUrl = `${environment.BACK_URL}/ventas`;

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estadisticas`);
  }
}
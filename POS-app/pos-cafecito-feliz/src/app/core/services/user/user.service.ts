import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.BACK_URL}users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(this.baseUrl, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  activateUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/activate`, {});
  }
}
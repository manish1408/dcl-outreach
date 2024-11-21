import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'https://medicalreportmaker.azurewebsites.net'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getCustomers(skip:any, limit:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers/?skip=${skip}&limit=${limit}`);
  }

  addCustomer(customer: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }

  editCustomer(id: string, customer: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

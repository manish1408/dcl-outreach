import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LinkedInLeadsService {
  private apiUrl = `${environment['API_DCLERP']}/linkedin-leads`;

  constructor(private http: HttpClient) {}

  saveLeads(leads: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, leads);
  }

  getLeads(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getLeadById(leadId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${leadId}`);
  }

  updateLead(leadId: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${leadId}`, updates);
  }

  deleteLead(leadId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${leadId}`);
  }

  deleteAllLeads(userId?: string): Observable<any> {
    let params = new HttpParams();
    
    if (userId) {
      params = params.append('userId', userId);
    }
    
    return this.http.delete<any>(this.apiUrl, { 
      params: userId ? params : undefined
    });
  }

  deleteBatchLeads(leadIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete-batch`, { leadIds });
  }

  approveLead(leadId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${leadId}/approve`, {});
  }

  approveBatchLeads(leadIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/approve-batch`, { leadIds });
  }
}

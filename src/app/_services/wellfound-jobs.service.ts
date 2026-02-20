import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class WellfoundJobsService {
  private apiUrl = `${environment['API_DCLERP']}/wellfound-jobs`;

  constructor(private http: HttpClient) {}

  saveJobs(jobs: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, jobs);
  }

  getJobs(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined) {
          params = params.append(key, value.toString());
        }
      });
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getJob(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${jobId}`);
  }

  updateJob(jobId: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${jobId}`, updates);
  }

  deleteJob(jobId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${jobId}`);
  }

  deleteAllJobs(userId?: string): Observable<any> {
    let params = new HttpParams();
    
    if (userId) {
      params = params.append('userId', userId);
    }
    
    return this.http.delete<any>(this.apiUrl, { 
      params: userId ? params : undefined
    });
  }

  deleteJobs(jobIds: string[]): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/batch`, {
      body: { jobIds }
    });
  }
}

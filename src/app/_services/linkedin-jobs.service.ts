import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LinkedInJobsService {
  private apiUrl = `${environment['API_DCLERP']}/linkedin-jobs`;

  constructor(private http: HttpClient) {}

  saveJobs(jobs: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, jobs);
  }

  createJob(job: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, job);
  }

  getJobs(filters?: any): Observable<any> {
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

  getJobById(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${jobId}`);
  }

  updateJob(jobId: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${jobId}`, updates);
  }

  deleteJob(jobId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${jobId}`);
  }

  deleteAllJobs(): Observable<any> {
    return this.http.delete<any>(this.apiUrl);
  }
}

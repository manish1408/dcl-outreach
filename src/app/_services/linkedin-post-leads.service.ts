import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LinkedInPostLeadsService {
  private base = `${environment['API_DCLERP']}/linkedin-post-leads`;

  constructor(private http: HttpClient) {}

  scrape(postUrl: string): Observable<any> {
    return this.http.post<any>(`${this.base}/scrape`, { postUrl });
  }

  list(params: {
    postUrl?: string;
    userId?: string;
    name?: string;
    headline?: string;
    reactionType?: string;
    sourceType?: string;
    hasComment?: boolean;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.http.get<any>(this.base, { params: httpParams });
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  update(id: string, body: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/${id}`);
  }

  deleteBatch(leadIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.base}/delete-batch`, { leadIds });
  }
}

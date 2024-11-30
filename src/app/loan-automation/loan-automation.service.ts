import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class LoanAutomationService {
  private _url = `https://api.extracta.ai/api/v1`;
  private token = 'MTg4MzI1MTI3Mg==_zni5ui8efaoriteu4tw3';

  constructor(
    private http: HttpClient,
  ) { }



  uploadFileApi(data: any): Observable<any> {
  // Set the headers
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`,
  });

  return this.http.post<any>(`${this._url}/uploadFiles`, data, { headers });
  }

  batchResultsApi(data: any): Observable<any> {
    // Set the headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
    });
  
    return this.http.post<any>(`${this._url}/getBatchResults`, data, { headers });
    }
}

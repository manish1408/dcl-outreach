import { Injectable } from '@angular/core';

import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class VisitorsService {
  private _url = `${environment['APIUrl']}/visitors`;
  constructor(private http: HttpClient) {}

  getAllVisitors() {
    return this.http.get<any>(`${this._url}/getAllVisitors`);
  }
  deleteVisitor(reqObj: any) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: reqObj,
    };
    return this.http.delete<any>(`${this._url}/deleteVisitors`, options);
  }
}

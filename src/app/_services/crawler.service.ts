import { Injectable } from '@angular/core';

import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CrawlerService {
  private _url = `${environment['APIUrl']}/crawl`;
  constructor(private http: HttpClient) {}

  startCrawl(data: any) {
    return this.http.post<any>(`${this._url}/start-crawl`, data);
  }
}

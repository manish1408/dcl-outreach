import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _url = `${environment['APIUrl']}/dashboard`;
  constructor(private http: HttpClient) {}

  getStats( chatbotId: string,timeFrame:number) {
    return this.http.get<any>(
      `${this._url}/get-dashboard-stats?chatbotId=${chatbotId}&timeFrame=${timeFrame}`
    );
  }
  getDeviceType(email: string, chatbotId: string) {
    return this.http.get<any>(
      `${this._url}/getDeviceType?email=${email}&chatbotId=${chatbotId}`
    );
  }
  getRegion(email: string, chatbotId: string) {
    return this.http.get<any>(
      `${this._url}/getRegion?email=${email}&chatbotId=${chatbotId}`
    );
  }
}

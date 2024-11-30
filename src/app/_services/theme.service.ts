import { Injectable } from '@angular/core';

import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _url = `${environment['APIUrl']}/themes`;
  constructor(private http: HttpClient) {}

  getAllThemes() {
    return this.http.get<any>(`${this._url}/getAllThemes`);
  }
  getuserThemes(id: string,chatBotId:string) {
    return this.http.get<any>(`${this._url}/get-user-theme?userId=${id}&chatBotId=${chatBotId}`);
  }
  updateUserTheme(data: any) {
    return this.http.put<any>(`${this._url}/update-user-theme`, data);
  }
  saveUserTheme(data: any) {
    return this.http.post<any>(`${this._url}/saveUserTheme`, data);
  }
  getuserConfigureDetails(id: string,chatBotId:string) {
    return this.http.get<any>(`${this._url}/getUserConfigures?userId=${id}&chatBotId=${chatBotId}`);
  }
  saveUserConfigures(data: any) {
    return this.http.post<any>(`${this._url}/saveUserConfigures`, data);
  }
  saveAvatarImage(data: any) {
    return this.http.post<any>(`${this._url}/uploadAvatarImg`, data);
  }
}

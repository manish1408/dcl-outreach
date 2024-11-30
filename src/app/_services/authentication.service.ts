import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _url = `${environment['APIUrl']}/auth`;
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  login(data: any) {
    return this.http.post<any>(`${this._url}/login`, data);
  }
  createAccount(data: any) {
    return this.http.post<any>(`${this._url}/create-account`, data);
  }
  onboardUser(data: any) {
    return this.http.post<any>(`${this._url}/onboard-user`, data);
  }
  validateLogin(data: any) {
    return this.http.post<any>(`${this._url}/verify-otp`, data);
  }
  signOut(): void {
    sessionStorage.clear();
    localStorage.clear();
  }
  isAuthenticated() {
    const token = this.localStorageService.getItem('MILO-USER-TOKEN');
    return !!token;
  }
  forgotPassword(data: any) {
    return this.http.post<any>(`${this._url}/forgot-password`, data);
  }
  resetPassword(data: any) {
    return this.http.post<any>(`${this._url}/reset-password`, data);
  }
  changePassword(data: any) {
    return this.http.put<any>(`${this._url}/change-password`, data);
  }
  updateProfile(data: any) {
    return this.http.put<any>(`${this._url}/update-user-profile`, data);
  }
  saveWidgetImage(data: any) {
    return this.http.post<any>(`${this._url}/upload-widget-img`, data);
  }
}

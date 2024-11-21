import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  roles: string[] = [];
  showAdmin = false;
  showPartner = false;
  showManagement = false;

  constructor(private apiService: ApiService, private localStorageService: LocalStorageService) {
  }

  async signUp(user: any): Promise<any> {
    return await this.apiService
      .post('Authentication/signup', user)
      .toPromise();
  }

  async register(user: any): Promise<any> {
    return await this.apiService
      .post('Authentication/register', user)
      .toPromise();
  }

  async setPassword(passwordReset: any): Promise<any> {
    return await this.apiService
      .post('Authentication/set-password', passwordReset)
      .toPromise();
  }

  async signIn(user: any): Promise<any> {
    return await this.apiService
      .postForm('Authentication/signin', user)
      .toPromise();
  }

  async validate(emailAddress: string): Promise<any> {
    return await this.apiService
      .postForm('Authentication/validate', {
        "value": emailAddress,
        "mode": 'email'
      })
      .toPromise();
  }


  async forgotPassword(user: any): Promise<any> {
    return await this.apiService
      .post('Authentication/forget-password', user)
      .toPromise();
  }

  signOut(): void {
    sessionStorage.clear();
    localStorage.clear();
  }

  isAuthenticated() {
    const token = this.localStorageService.getItem('CION-USER-TOKEN');
    return !!token;
  }
}

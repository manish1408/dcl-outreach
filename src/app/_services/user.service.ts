import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	constructor(private apiService: ApiService, private localStorageService: LocalStorageService) {}

	getUserDetails(): any {
		const result = this.localStorageService.getItem('CION-USER');
		const user = result ? JSON.parse(result) : null;
		return user;
	}

	isLoggedIn(): boolean {
		let user = this.localStorageService.getItem('CION-USER') as any;
		if (user) {
			return true;
		}
		return false;
	}

	getUser(): Promise<any> {
		return this.apiService.get('User').toPromise();
	}

	async updateUser(user: any): Promise<any> {
		return await this.apiService.put('User', user).toPromise();
	}

	uploadPicture(formData: FormData): Observable<any> {
		const headers = new HttpHeaders();
		headers.append('Content-Type', 'multipart/form-data');
		return this.apiService.put(`User/upload-picture`, formData, { headers });
	}
	updateNotification(reqObj: any): Observable<any> {
		return this.apiService.put(`User/updated-notification-settings`, reqObj);
	}
	getUserMembership(): Promise<any> {
		return this.apiService.get('User/get-membership').toPromise();
	}
}

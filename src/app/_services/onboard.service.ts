import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class OnboardService {
	constructor(private apiService: ApiService) {}

	async onboard(onboard: any): Promise<any> {
		return await this.apiService.post('User/onboard', onboard).toPromise();
	}
}

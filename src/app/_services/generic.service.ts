import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { saveAs } from 'file-saver';
import { ToastService } from './toast.service';
@Injectable({
	providedIn: 'root',
})
export class GenericService {
	constructor(private apiService: ApiService, private toastService: ToastService) {}

	async getTopics(): Promise<any> {
		return await this.apiService.get('Generic/topics').toPromise();
	}
	async getCoachingTopics(): Promise<any> {
		return await this.apiService.get('Generic/topics?type=coaching').toPromise();
	}

	async getNiches(): Promise<any> {
		return await this.apiService.get('Generic/niches').toPromise();
	}

	async getMarketingStrategies(): Promise<any> {
		return await this.apiService.get('Generic/marketing-strategies').toPromise();
	}
	async getAllWebinarTopics(): Promise<any> {
		return await this.apiService.get('Generic/webinar-topics').toPromise();
	}

	async getAllWebinars(): Promise<any> {
		return await this.apiService.get('Resource/webinars').toPromise();
	}
	downloadMyContent(file: any) {
		const fileUrl = file.downloadedFile || file.assetUrl;
		// console.log(fileUrl);
		fetch(fileUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
				}
				return response.blob();
			})
			.then((blob) => {
				saveAs(blob, file.slug);
			})
			.catch((error) => {
				console.error(error);
				this.toastService.showError('Failed to download file');
			});
	}

	async favouriteCoaching(favId: any, type: string): Promise<any> {
		return await this.apiService.put('Favorite/' + favId + `/${type}`).toPromise();
	}

	async unfavouriteCoaching(favId: any, type: string): Promise<any> {
		return await this.apiService.put('Favorite/undo/' + favId + `/${type}`).toPromise();
	}

	async getFinPlan(id:any): Promise<any> {
		return await this.apiService.get('FinPlan/'+ id).toPromise();
	}

	async getFinPlanbySlug(slug:any, company_name:any): Promise<any> {
		return await this.apiService.get('FinPlan/get/' +  company_name + '/' + slug).toPromise();
	}
}

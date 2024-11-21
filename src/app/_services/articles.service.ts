import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private apiService: ApiService, private http: HttpClient) {}

  async getAllArticles(body: any): Promise<any> {
    return await this.apiService.post('Article/get-all', body).toPromise();
  }

  async getAllEmailCampaigns(body: any): Promise<any> {
    return await this.apiService.post('api/Campaigns/get-all', body).toPromise();
  }
  async getMyContentAllArticles(body: any): Promise<any> {
    return await this.apiService
      .get(
        `Article/my-content?source=${body.source}&status=${body.status}&page=${body.page}&count=${body.count}`
      )
      .toPromise();
  }

  async getArticleById(id: any): Promise<any> {
    return await this.apiService.get('Article/' + id).toPromise();
  }

  async getSpotlights(): Promise<any> {
    return await this.apiService
      .get('Article/get-spotlights?page=1&count=999')
      .toPromise();
  }

  async updateArticle(article: any): Promise<any> {
    return await this.apiService.post('Article/update', article).toPromise();
  }

  async favouriteArticle(article: any): Promise<any> {
    return await this.apiService
      .post('Article/' + article + '/favorite')
      .toPromise();
  }

  async unfavouriteArticle(article: any): Promise<any> {
    return await this.apiService
      .post('Article/' + article + '/unfavorite')
      .toPromise();
  }

  reset(articleId: any) {
    return this.apiService.post('Article/' + articleId + '/reset');
  }
  download(articleId: any) {
    return this.http.post(this.apiService.apiUrl +  '/Article/' + articleId + '/download', {},
      {
        responseType: 'blob',
        observe: "response"
      });
  }

  share(articleId: any) {
    return this.apiService.post('Article/' + articleId + '/share');
  }

  export(body: any): Observable<any> {
    return this.apiService.post(
      `Article/download-my-content?source=${body.source}&status=${body.status}`,
      {},
      {
        responseType: 'blob',
      }
    );
  }
}

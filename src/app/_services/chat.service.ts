import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _url = `${environment['APIUrl']}/chatbot`;
  constructor(private http: HttpClient) {}

  interact(data: any) {
    return this.http.post<any>(`${this._url}/interact`, data);
  }
  addArticle(assistantId: string, questions: any[]): Observable<any> {
    return this.http.post(`${this._url}/add-custom-article`, {
      assistantId,
      questions,
    });
  }
  
  getAllArticles(chatbotId: string): Observable<any> {
    return this.http.get(`${this._url}/get-all-articles?chatbotId=${chatbotId}`);
  }
  deleteArticle(chatbotId:string , questionId:string) {
    return this.http.delete<any>(`${this._url}/delete-article?chatbotId=${chatbotId}&questionId=${questionId}`);
  }
  updateArticle(data: any) {
    return this.http.put<any>(`${this._url}/update-article`, data);
  }
  getAllChatbots(): Observable<any> {
    return this.http.get(`${this._url}/get-all-chatbots`);
  }
  createChatbot(data: any) {
    return this.http.post<any>(`${this._url}/create-chatbot`, data);
  }
  deleteChatbot(chatbotId:string) {
    return this.http.delete<any>(`${this._url}/delete-chatbot?chatbotId=${chatbotId}`);
  }
  getAllChatbotDetails(): Observable<any> {
    return this.http.get(`${this._url}/get-all-chatbots`);
  }
  updateChannel(data: any) {
    return this.http.put<any>(`${this._url}/update-chatbot-channels`, data);
  }    
  getInteractions(chatbotId: string): Observable<any> {
    return this.http.get(`${this._url}/get-interactions?chatbotId=${chatbotId}`);
  }
  updateInteractions(data: any): Observable<any> {
    return this.http.put<any>(`${this._url}/update-interaction`, data);
  }
  getPersona(chatbotId: string): Observable<any> {
    return this.http.get(`${this._url}/get-persona?chatbotId=${chatbotId}`);
  }
  updatePersona(data: any): Observable<any> {
    return this.http.put<any>(`${this._url}/update-persona`, data);
  }
  getAllDocs(chatbotId:string) {
    return this.http.get<any>(`${this._url}/get-all-Docs?chatbotId=${chatbotId}`);
  }
  uploadDocs(data: any) {
    return this.http.post<any>(`${this._url}/upload-docs`, data);
  }
  deleteFile(fileId: string,chatbotId:string) {
    // const options = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //   }),
    //   body: reqObj,
    // };
    return this.http.delete<any>(`${this._url}/delete-file/${fileId}?chatbotId=${chatbotId}`, {});
  }

  getChatbotDetails(chatbotId:string){
    return this.http.get<any>(`${this._url}/get-chatbot-details?chatbotId=${chatbotId}`);
  }  

  addWebsiteUrl(data: any) {
    return this.http.post<any>(`${this._url}/add-website-url`, data);
  }

  deleteWebsiteUrl(chatbotId: string, id: string) {
    return this.http.delete<any>(`${this._url}/delete-website-url?id=${id}&chatbotId=${chatbotId}`);
  }

  getWebsiteUrlsList(chatbotId: string): Observable<any> {
    return this.http.get(`${this._url}/get-all-websites-url?chatbotId=${chatbotId}`);
  }

  ingestFiles(chatbotId: string){
    return this.http.post(`${environment['APIUrl']}/ai/ingest-docs?chatbotId=${chatbotId}`,{});
  }

  ingestWebUrls(chatbotId: string){
    return this.http.post(`${environment['APIUrl']}/ai/ingest-website-url?chatbotId=${chatbotId}`,{});
  }

  ingestArticles(chatbotId: string){
    return this.http.post(`${environment['APIUrl']}/ai/ingest-custom-article?chatbotId=${chatbotId}`,{});
  }

}

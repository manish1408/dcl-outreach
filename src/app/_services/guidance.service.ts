import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuidanceService {
  private _url = `${environment['APIUrl']}/guidance`;
  constructor(private http: HttpClient) {}

  getAllGuidance(chatbotId:string){
    return this.http.get(`${this._url}/get-all-guidance?chatbotId=${chatbotId}`);
  }
  createGuidance(data: any) {
    return this.http.post<any>(`${this._url}/create-guidance`, data);
  }
  updateGuidance(data: any) {
    return this.http.put<any>(`${this._url}/update-guidance`, data);
  }
  deleteGuidance(chatbotId:string , guidanceId:string) {
    return this.http.delete<any>(`${this._url}/delete-guidance?chatbotId=${chatbotId}&guidanceId=${guidanceId}`);
  }
}

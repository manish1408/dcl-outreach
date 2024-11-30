import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private _url = `${environment['APIUrlJabulani']}`;
  constructor(private http: HttpClient) {}

  getAllPrompts(){
    return this.http.get(`${this._url}/prompts/`);
  }
  createPrompt(data: any) {
    return this.http.post<any>(`${this._url}/prompts/`, data);
  }
  updatePrompt(data: any,promptId:string) {
    return this.http.put<any>(`${this._url}/prompts/${promptId}`, data);
  }
  deletePrompt(promptId:string) {
    return this.http.delete<any>(`${this._url}/prompts/${promptId}`);
  }
}

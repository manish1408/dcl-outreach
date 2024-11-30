import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {
  private _url = `${environment['APIUrl']}/workflow`;
  constructor(private http: HttpClient) {}

  getAllWorkFlow(chatbotId:string){
    return this.http.get(`${this._url}/get-all-workflow?chatbotId=${chatbotId}`);
  }
  createWorkFlow(data: any) {
    return this.http.post<any>(`${this._url}/create-workflow`, data);
  }
  updateWorkFlow(data: any) {
    return this.http.put<any>(`${this._url}/update-workflow`, data);
  }
  deleteWorkFlow(chatbotId:string , workflowId:string) {
    return this.http.delete<any>(`${this._url}/delete-workflow?chatbotId=${chatbotId}&workflowId=${workflowId}`);
  }

}

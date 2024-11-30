import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkFlowJabService {
    private _url = `${environment['APIUrlJabulani']}`;
    constructor(private http: HttpClient) {}

  getAllDocs(chatbotId:string) {
    return this.http.get<any>(`${this._url}/get-all-Docs?chatbotId=${chatbotId}`);
  }

  uploadDocs(data: any) {
    console.log('data: ', data);
    return this.http.post<any>(`${this._url}/upload-pdf/`, data);
  }
  deleteFile(fileId: string,chatbotId:string) {
  
    return this.http.delete<any>(`${this._url}/delete-file/${fileId}?chatbotId=${chatbotId}`, {});
  }

}

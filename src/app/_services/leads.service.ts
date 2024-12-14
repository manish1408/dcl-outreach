import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private _url = `${environment['API_DCLERP']}`;
  constructor(private http: HttpClient) {}

  getAllLeads(data:any){
    return this.http.post(`${this._url}/leads/get-all-leads`, data);
  }
  searchLead(searchText: any) {
    return this.http.get<any>(`${this._url}/leads/search-lead?domainKeyword=${searchText}`);
  }
  getLeadDetail(rootDomain:string) {
    return this.http.get<any>(`${this._url}/leads/get-lead-detail?rootDomain=${rootDomain}`);
  }
  updateLead(data: any,leadId:string) {
    return this.http.put<any>(`${this._url}/leads/leads/update?leadId=${leadId}`, data);
  }
  deleteLead(leadId:string) {
    return this.http.delete<any>(`${this._url}/prompts/${leadId}`);
  }
}

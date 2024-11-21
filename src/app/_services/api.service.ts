import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) { }

  apiUrl = environment.APIUrl;

  get(endpoint: string, options: object = {}): Observable<any> {
    if (endpoint.startsWith('./')) {
      return this.http.get(`${endpoint}`, options).pipe(catchError(this.handleError));
    }
    return this.http.get(`${this.apiUrl}/${endpoint}`, options).pipe(catchError(this.handleError));
  }

  post(endpoint: string, body: object = {}, options: object = {}): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, body, options).pipe(catchError(this.handleError));
  }

  postForm(endpoint: string, body: object = {}, options: object = {}): Observable<any> {
    let fd = this.jsonToFormData(body, new FormData());
    return this.http.post(`${this.apiUrl}/${endpoint}`, fd, options).pipe(catchError(this.handleError));
  }

  putForm(endpoint: string, body: object = {}, options: object = {}): Observable<any> {
    let fd = this.jsonToFormData(body, new FormData());

    console.log(body);
    return this.http.put(`${this.apiUrl}/${endpoint}`, fd, options).pipe(catchError(this.handleError));
  }

  putWithForm(endpoint: string, fd: FormData, options: object = {}): Observable<any> {
    return this.http.put(`${this.apiUrl}/${endpoint}`, fd, options).pipe(catchError(this.handleError));
  }

  put(endpoint: string, body: object = {}, options: object = {}): Observable<any> {
    return this.http.put(`${this.apiUrl}/${endpoint}`, body, options).pipe(catchError(this.handleError));
  }

  delete(endpoint: string, options: object = {}): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}`, options).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('There was an error calling our API. We have been informed of this. Please try again or contact Cion Worldwide support');
  }

  isObject(obj: any): boolean {
    return obj === Object(obj);
  }

  jsonToFormData(model: any, form: FormData, namespace = ''): FormData {
    let formData = form || new FormData();
    let formKey = '';

    for (let propertyName in model) {
      if (!model.hasOwnProperty(propertyName) || !model[propertyName]) continue;
      let formKey = namespace ? `${namespace}.${propertyName}` : propertyName;
      if (model[propertyName] instanceof Date)
        formData.append(formKey, model[propertyName].toISOString());
      else if (model[propertyName] instanceof Array) {
        model[propertyName].forEach((element: any, index: number) => {
          if (typeof element === 'object') {
            const tempFormKey = `${formKey}[${index}]`;
            this.jsonToFormData(element, formData, tempFormKey);
          } else {
            formData.append(formKey, element);
          }
        });
      }
      else if (typeof model[propertyName] === 'object' && !(model[propertyName] instanceof File))
        this.jsonToFormData(model[propertyName], formData, formKey);
      else if (typeof model[propertyName] === 'object' && (model[propertyName] instanceof File)) {
        formData.append(formKey, model[propertyName]);
      }
      else
        formData.append(formKey, model[propertyName]);
    }
    return formData;
  }


}

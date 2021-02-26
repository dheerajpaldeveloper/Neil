import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /******************** HTTP FormData ********************/
  appendFormData(myFormData: { [x: string]: any; }): FormData {
    let fd = new FormData();
    for (let key in myFormData) {
      fd.append(key, myFormData[key]);
    }
    return fd;
  }

  /******************** HTTP Params ********************/
  private appendParams(myParams: { [x: string]: any; }): HttpParams {
    let params = new HttpParams();
    for (let key in myParams) {
      if (!myParams[key]) continue;
      params = params.append(key, myParams[key]);
    }
    return params;
  }

  /******************* Http Headers*************************/

  get headers(): HttpHeaders {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    headers.set('Accept', '*/*');
    return headers;
  }


  public get(url: string, params?: { [x: string]: any; }): Observable<any> {
    let _params = params ? { params: this.appendParams(params) } : {};
    return this.httpClient.get<any>(url, _params);
  }

  public post(url: string, data: { [x: string]: any; } | any): Observable<any> {
    return this.httpClient.post<HttpClient>(url, data)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  public put(url: string, data: { [x: string]: any; }): Observable<any> {
    return this.httpClient.put<HttpClient>(url, data)
      .pipe(
        map(response => {
          if (response['status'] === 200) return response;
        })
      );
  }

  public delete(url: string, id: string): Observable<any> {
    return this.httpClient.delete<HttpClient>(url + '/' + id)
      .pipe(
        map(response => {
          if (response['status'] === 200) return response;
        })
      );
  }

  public postFormData(url, data: { [x: string]: any; } | any): Observable<any> {
    return this.httpClient.post<HttpClient>(url, this.appendParams(data), { headers: this.headers })
  }

  public fileUpload(url: string, data: { [x: string]: any; } | any): Observable<any> { 
    return this.httpClient.post<HttpClient>(url, this.appendFormData(data))
      .pipe(
        map(response => {
          return response;
        })
      );
  }

}

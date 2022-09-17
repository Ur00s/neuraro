import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {

  url = environment.backendUrl;
  private token = this.accService.setToken();

  constructor(private http: HttpClient, private accService: AccountService) { }

  createExperiment(data: any): Observable<any> {
    let userID;
    this.accService.curentUser$.pipe(takeUntil(this.accService.terminateSubscriptions)).subscribe(user => userID = user.id);
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    let options = new HttpHeaders({ 
      'Authorization' : 'bearer ' + newToken,
      'Content-Type' : 'application/json'
    });
    return this.http.post<any>(this.url + "experiments/create/" + userID, data, {headers: options});
  }

  getAllExperiments(): Observable<any> {
    let userID;
    this.accService.curentUser$.pipe(takeUntil(this.accService.terminateSubscriptions)).subscribe(user => userID = user.id);
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    let options = new HttpHeaders({ 
      'Authorization' : 'bearer ' + newToken,
      'Content-Type' : 'application/json'
    });
    return this.http.get<any>(this.url + "experiments/" + userID, {headers: options});
  }

  deleteExperiments(expId: number): Observable<any> {
    let userID;
    this.accService.curentUser$.pipe(takeUntil(this.accService.terminateSubscriptions)).subscribe(user => userID = user.id);
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    let options = new HttpHeaders({ 
      'Authorization' : 'bearer ' + newToken,
      'Content-Type' : 'application/json'
    });
    return this.http.delete<any>(this.url + "experiments/" + expId, {headers: options});
  }

  getExperimentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}experiments/exp/${id}`);
  }

  makePredictions(data: any): Observable<any> {
    return this.http.post<any>(`${this.url}experiments/predict`, data);
  }
}

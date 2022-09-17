import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AdminChange } from '../_models/AdminChanges';
import { Profile } from '../_models/Profile';
import { User } from '../_models/users';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';
import { SavedFile } from '../_models/SavedFile';
import { TrainHubService } from './train-hub.service';
import { GlobalVariable } from '../_globalVariables/globalVariable';

const httpOptions = { 
  headers : new HttpHeaders({
  'Content-Type' : 'application/json'
})};
@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  baseUrl = environment.backendUrl;
  private token = this.accService.setToken();
  constructor(private http:HttpClient, private accService: AccountService,private chartHub: TrainHubService) { }

  uploadFile(formData: any): Observable<any>{
    let userID;
    this.accService.curentUser$.subscribe(user => userID = user.id);
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    let options = new HttpHeaders({ 
      'Authorization' : 'bearer ' + newToken
    });
    return this.http.post<any>(this.baseUrl+"file/upload/" + userID, formData, {headers: options});
  }
  getNeuroModel(data: any): Observable<any>{
    return this.http.post<any>(this.baseUrl+"ann",data,httpOptions);
  }

  getAllFiles(): Observable<SavedFile[]> {
    let userID;
    this.accService.curentUser$.pipe(takeUntil(this.accService.terminateSubscriptions)).subscribe(user => userID = user.id);
    this.token.set("Content-Type", "application/json");
    return this.http.get<SavedFile[]>(this.baseUrl + "file/" + userID, { headers : this.token });
  }

  loadTable(id: number): Observable<any> {
    this.token.set("Content-Type", "application/json");
    return this.http.get(this.baseUrl + "file/load/" + id, { headers : this.token });
  }

  loadPageFromTo(fileID:number,from:number, to:number): Observable<any>
  {
    this.token.set("Content-Type", "application/json");
    return this.http.get(this.baseUrl + "file?fileId="+fileID+"&from="+from+"&to="+to, { headers : this.token });
  }

  deleteFile(id:number): Observable<any>{
    return this.http.delete<any>(this.baseUrl+"file/delete/"+id);
  }

  getOutliers(object:any)
  {
    return this.http.post<any>(this.baseUrl+"Outliers/",object);
  }

  clearOutliers(object:any)
  {
    return this.http.post<any>(this.baseUrl+"Outliers/delete",object);
  }

  livetrain(data:any): Observable<any>{
    //console.log(this.chartHub.connectionId)
    let userID;
    this.accService.curentUser$.pipe(takeUntil(this.accService.terminateSubscriptions)).subscribe(user =>{userID = user.id});
    let experiment = sessionStorage.getItem("experimentID");
    let experimentJson = JSON.parse(experiment!);
    let experimentId = Number(experimentJson!);
    return this.http.post<any>(this.baseUrl+"ann/model/"+this.chartHub.connectionId + "/" + experimentId + "/" + userID,data);
  }
 
}

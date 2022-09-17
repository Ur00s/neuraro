import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminChange } from '../_models/AdminChanges';
import { Profile } from '../_models/Profile';
import { User } from '../_models/users';
import { environment } from 'src/environments/environment';
import { PresenceService } from './presence.service';
import { TrainHubService } from './train-hub.service';
import { GlobalVariable } from '../_globalVariables/globalVariable';
import { NotificationService } from './notification.service';
import { NotificationsGlobal } from '../_globalVariables/NotificationsGlobal';
import { Router } from '@angular/router';
import { Table } from '../_models/Table';

const httpOptions = {
  headers : new HttpHeaders({
  'Content-Type' : 'application/json'
})};

@Injectable({
  providedIn: 'root'
})

export class AccountService {


  baseUrl = environment.backendUrl;
  private currentUserSource = new ReplaySubject<any>(1);
  curentUser$ =  this.currentUserSource.asObservable();

  public terminateSubscriptions = new Subject();

  private table = Table;
  private glob = GlobalVariable;
  private allnoti = NotificationsGlobal;
  constructor(private http:HttpClient,private presence: PresenceService,private chartHub: TrainHubService,
    private notiService:NotificationService,
    private router : Router) { }

  public setToken()
  {
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    return new HttpHeaders({
      'Authorization' : 'bearer ' + newToken,
      'Content-Type' : 'application/json'
    });
  }

  getJWTToken() {
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    return newToken;
  }

  googleRegister(usr:any):Observable<any>
  {
    return this.http.post<any>(this.baseUrl+'google/register',usr);
  }
  googleCheck(usr:any):Observable<any>
  {
    return this.http.post<any>(this.baseUrl+'google/check',usr);
  }
  googleLogin(usr:any){
    return this.http.post(this.baseUrl+'google/login',usr).pipe(
      map((response:any)=>{
        const user = response;
        if(user){
          sessionStorage.setItem('isGoogleUser',JSON.stringify(true));
          sessionStorage.setItem('user',JSON.stringify(user.token));
          this.glob.isGoogleUser=true;
          this.currentUserSource.next(user);
          this.presence.createHubConnection(user);
          this.chartHub.createHubConnection(user);
          this.notiService.GetUserNotis(user.id).subscribe(notifs=>{
            this.allnoti.AllNotifications=notifs;
            //console.log(notifs)
          })
          this.presence.insertNotifi(user);
          this.presence.deleteNotifi(user);
        }
      })
    )
  }
  register(model:any)
  {
    return this.http.post(this.baseUrl+'auth/registration',model).pipe(
      map((user: any)=> {
        if(user)
        {
        }
      })
    )
  }
  login(model:any){
    return this.http.post(this.baseUrl+'auth/login',model).pipe(
      map((response: any)=>{
        const user = response;
        if(user){
          sessionStorage.setItem('user',JSON.stringify(user.token));
          sessionStorage.setItem('isGoogleUser',JSON.stringify(false));
          this.glob.isGoogleUser=false;
          this.currentUserSource.next(user);
          this.presence.createHubConnection(user);
          this.chartHub.createHubConnection(user);
          this.notiService.GetUserNotis(user.id).subscribe(notifs=>{
            this.allnoti.AllNotifications=notifs;
            //console.log(notifs)
          })
          this.presence.insertNotifi(user);
          this.presence.deleteNotifi(user);
        }
      })
    )
  }
  public IsGoogleUser(id:number):Observable<boolean>
   {
    return this.http.get<boolean>(this.baseUrl+'google/isGoogleUser/'+id);
   }
  update(model:any,chpass:number): Observable<Profile>{
    return this.http.post<Profile>(this.baseUrl+'profile/'+model.id+"/"+chpass,model,{headers : this.setToken()});
  }

  getAllUsers(): Observable<User[]>{

    return this.http.get<User[]>(this.baseUrl+"users", {headers : this.setToken()});
  }
  getUser(id: number): Observable<any>{
    return this.http.get<any>(this.baseUrl+"users/"+id,{headers : this.setToken()});
  }
  setCurrentUser(user: User)
  {
    this.currentUserSource.next(user);

  }
  logout(){
    sessionStorage.removeItem('user');
    this.terminateSubscriptions.next(true);
    this.currentUserSource.next(null);
    this.glob.fileprojects=true;
    this.glob.data=false;
    this.glob.parameters=false;
    this.glob.models=false;
    this.glob.expName="";
    this.table.setShowTable(false);
    sessionStorage.clear()
    this.presence.stopHubConnection();
    this.router.navigate(["/"]);
  }
  delete(id: any): Observable<User[]>{
    return this.http.delete<User[]>(this.baseUrl+"users/delete/"+id,{headers : this.setToken()});
  }
  PromoteDemote(id:any,pd:String): Observable<User[]>{
    return this.http.put<User[]>(this.baseUrl+"users/admin/"+id,pd,{headers : this.setToken()});
  }
  Adminupdate(model:any,chpass:number): Observable<Profile>{
    return this.http.post<Profile>(this.baseUrl+'users/edit/'+model.id+"/"+chpass,model,httpOptions);
  }
  UploadFile(model:any,userId:number): Observable<any>{
    let userID;
    this.curentUser$.subscribe(user => userID = user.id);
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    let options = new HttpHeaders({
      'Authorization' : 'bearer ' + newToken
    });
    // console.log(model);
    // console.log(userId);
    return this.http.post<any>(this.baseUrl+"images/upload/"+userId,model, {headers: options})
  }
  GetUserPhoto(userId:number): Observable<any>{
    return this.http.get<any>(this.baseUrl+'images/'+userId,{headers : this.setToken()});
  }
}

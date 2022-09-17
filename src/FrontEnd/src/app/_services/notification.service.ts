import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccountService } from './account.service';
import { PresenceService } from './presence.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = environment.backendUrl;

  constructor(private http: HttpClient,private hub: PresenceService) { }

  public insertNotif(notifi:any):  Observable<any>
  {
    return this.http.post<any>(this.baseUrl+"notification/insert",notifi);
  }
  public GetUserNotis(id:number): Observable<any[]>
  {
    return this.http.get<any[]>(this.baseUrl+"notification/UserNotifs/"+id);
  }
  public DeleteNotifi(id:number): Observable<any>
  {
    return this.http.delete<any>(this.baseUrl+"notification/delete/"+id);
  }
}

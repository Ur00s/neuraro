import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureSelectionService {

  baseUrl: string = environment.backendUrl;
  private token = this.accService.setToken();

  constructor(private http:HttpClient, private accService: AccountService) { }

  loadFeatureSelection(data: any, fileId: number): Observable<any> {
    let userID;
    this.accService.curentUser$.subscribe(user => userID = user.id);
    this.token.set("Content-Type", "application/json");
    return this.http.post<any>(this.baseUrl + "regression/" + fileId, data, { headers : this.token });
  }
}

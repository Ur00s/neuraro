import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class FillMissingService {
  baseUrl: string = environment.backendUrl;
  private token = this.accService.setToken();

  constructor(private http:HttpClient, private accService: AccountService) { }

  fillMissingValues(missingValuesArray: any): Observable<any> {
    let userID;
    this.accService.curentUser$.subscribe(user => userID = user.id);
    this.token.set("Content-Type", "application/json");
    let fileId = sessionStorage.getItem("TableID");
    return this.http.post(this.baseUrl + "missingval/" + fileId, missingValuesArray, { headers : this.token });
  }
}

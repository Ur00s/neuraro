import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class CorrMatrixService {

  baseUrl = environment.backendUrl;
  private token = this.accService.setToken();

  constructor(private accService: AccountService, private http:HttpClient) { }

  loadCorrMatrix(id: number): Observable<any> {
    this.token.set("Content-Type", "application/json");
    return this.http.post(this.baseUrl + "cor/" + id, { headers : this.token });
  }
}

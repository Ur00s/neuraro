import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileChangesService {
  baseUrl = environment.backendUrl;
  private token = this.accService.setToken();
  constructor(private http:HttpClient, private accService: AccountService) { }

  changeFile(data:any) {
    let userID;
    this.accService.curentUser$.subscribe(user => userID = user.id);
    let token=sessionStorage.getItem('user');
    let end = token?.length;
    const newToken = token?.slice(1, end! - 1);
    let options = new HttpHeaders({ 
      'Authorization' : 'bearer ' + newToken
    });
    return this.http.post<any>(this.baseUrl+"file/edit", data, {headers: options} );
  }
}

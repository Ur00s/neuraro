import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Param } from '../_models/param';

@Injectable({
  providedIn: 'root'
})
export class AnnService {
  baseUrl='https://localhost:5001/ann';
  constructor(private http:HttpClient) { }

  RequestP(model: Param){
    return this.http.post(this.baseUrl,model).pipe(
      map((reqq: any)=>{
        if(reqq){
          //console.log(reqq);
        }
      })
    )
  }
}

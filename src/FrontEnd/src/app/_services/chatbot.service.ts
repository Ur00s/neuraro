import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatbotResp } from '../_models/Chatbot';

const httpOptions = { 
  headers : new HttpHeaders({
  'Content-Type' : 'application/json'
})};

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  baseUrl = environment.backendUrl;

  constructor(private http:HttpClient) { }

  send(question:string):Observable<ChatbotResp>
  {
    return this.http.post<ChatbotResp>(this.baseUrl+"Bot/send",{
      pitanje:question
    })
  }
  test():Observable<boolean>
  {
    return this.http.get<boolean>(this.baseUrl+"Bot/check");
  }
}

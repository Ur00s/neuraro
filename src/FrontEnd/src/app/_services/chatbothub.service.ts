import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbothubService {
  hubUrl = environment.hubUrl;
  private hubConnection!: signalR.HubConnection;
  public connectionId!: string;
  constructor() { }

  createHubConnection()
  {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.None)
    .withUrl(this.hubUrl+'chatbot/')
    .withAutomaticReconnect()
    .build()

    this.hubConnection.start()
    .then(()=>this.getConnectionId())
    .catch(error=>console.log(error));

  }
  public getConnectionId = () => {
    if(this.hubConnection)
    {
      this.hubConnection.invoke('getconnectionid').then(
        (data) => {
          //console.log(data);
            this.connectionId = data;
          }
      ); 
    }
    
  }
  stopHubConnection()
  {
    this.hubConnection.stop().catch(error=>console.log(error));
  }
}

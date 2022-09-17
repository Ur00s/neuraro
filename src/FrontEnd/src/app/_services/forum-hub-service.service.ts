import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForumHubServiceService {
  hubUrl = environment.hubUrl;
  private hubConnection!: HubConnection;
  

  constructor(private toastr: ToastrService) { }

  createHubConnection()
  {
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl+'admin/')
    .withAutomaticReconnect()
    .build()

    this.hubConnection.start()
    .catch(error=>console.log(error));
  }
  SendDeleteTopic(topicid:number)
  { 
    this.createHubConnection();
    this.hubConnection.invoke("DeletedTopic",topicid).catch(error=>console.log(error));
    this.stopHubConnection();
  }
  stopHubConnection()
  {
    this.hubConnection.stop().catch(error=>console.log(error));
  }
  
}

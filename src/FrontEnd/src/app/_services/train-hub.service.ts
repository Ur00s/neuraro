import { Injectable } from '@angular/core';
import { Data } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ANNTraining } from '../_models/ANNTraining';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class TrainHubService {
  hubUrl = environment.hubUrl;
  private hubConnection!: signalR.HubConnection;
  public connectionId!: string;
  public data = ANNTraining;
  
  constructor(private toastr: ToastrService, private translate : TranslateService) { }
  public UpdateChart:Subject<ANNTraining>=new Subject<ANNTraining>();
  createHubConnection(user: any)
  {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.None)
    .withUrl(this.hubUrl+'chart/',{
      accessTokenFactory: () => user.token
    })
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

  public getMSELabel()
  {
    const problemType = sessionStorage.getItem('problemType');
    if (problemType) {
      if (problemType == 'regression')
        return "Training MSE";
      else
        return "Training Accuracy";
    } else {
      return "Training MSE";
    }
  }

  public getVMSELabel()
  {
    const problemType = sessionStorage.getItem('problemType');
    if (problemType) {
      if (problemType == 'regression')
        return "Validation MSE";
      else
        return "Validation Accuracy";
    } else {
      return "Validation MSE";
    }
  }


  public TrainRespone = () =>{
      // let epochs = Number(sessionStorage.getItem("NumEpochs"));
      // let epochsList = [];
      // for (let i = 1; i <= epochs; i++) {
      //   epochsList.push(i);
      // }
      // this.data.chartData1.labels = epochsList;
      // this.data.chartData2.labels = epochsList;
      this.hubConnection.on("chart",(response)=>{
      //console.log(response);
      
      this.data.setLoss(response.loss);
      this.data.setValLoss(response.valLoss);
      this.data.setMSE(response.meanSqauredError);
      this.data.setVMSE(response.valMeanSqauerdError);
      this.data.setMSELabel(this.getMSELabel());
      this.data.setVMSELabel(this.getVMSELabel());

      //console.log(response.epochs);

      

    
      
      this.data.chartData1.labels = response.epochs;
      this.data.chartData2.labels = response.epochs;
      //console.log(this.data.chartData1.labels);
      // console.log(sessionStorage.getItem('NumEpochs'));
      // console.log(response.epochs);
      
      if(sessionStorage.getItem('NumEpochs'))
      {
        let temp = sessionStorage.getItem('NumEpochs');
        
        if(temp==response.epochs[response.epochs.length-1])
        {
            this.toastr.success(this.translate.instant("toster.p3"),this.translate.instant("toster.p1"),{
              timeOut:10000,
              closeButton:true,
              positionClass:'toast-top-center'
            })
            this.data.setInProgress(false);
        }
      }
      this.UpdateChart.next(this.data);
      
    })
  }
  stopHubConnection()
  {
    this.hubConnection.stop().catch(error=>console.log(error));
  }
  
}

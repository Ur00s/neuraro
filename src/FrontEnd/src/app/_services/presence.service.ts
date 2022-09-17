import { Injectable, Injector } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ForumGlobal } from '../_globalVariables/ForumGlobal';
import { NotificationsGlobal } from '../_globalVariables/NotificationsGlobal';
import { AllComments } from '../_models/AllComments';
import { Hublikes } from '../_models/HubLikes';
import { Replies } from '../_models/Replies';
import { TopicDetails } from '../_models/TopicDetails';
import { Topic } from '../_models/Topics';
import { User } from '../_models/users';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection!: signalR.HubConnection;
  public static numberOfUsers:number;
  public forum = ForumGlobal;
  public connectionId!: string;
  public allnoti = NotificationsGlobal;
  constructor() { }

  createHubConnection(user: any)
  {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.None)
    .withUrl(this.hubUrl+'presence/',{
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build()

    this.hubConnection.start()
    .then(()=>this.getConnectionId())
    .catch(error=>console.log(error));

    // this.hubConnection.on('UserIsOnline',usersOnline=>{
    //   //this.toastr.info(username+ ' has connected')
    //   PresenceService.numberOfUsers=usersOnline
    // })

    // this.hubConnection.on('UserIsOffline',usersOnline=>{
    //   //this.toastr.warning(username+ " has disconnected")
    //   PresenceService.numberOfUsers=usersOnline
    // })
    
  }
  public UpdateProfilePic = (curUsr: any) =>{
    
  }
  public insertNotifi = (curUsr: any) =>
  {
    this.hubConnection.on("insertNofifi",(data)=>{
      // console.log(curUsr);
      // console.log(data);
      if(curUsr.id==data.userID)
      {
        this.allnoti.AllNotifications.push(data);
      }
      
    })
  }
  public deleteNotifi = (curUsr: any) =>
  {
    this.hubConnection.on("deleteNotifi",(data)=>{
      if(curUsr.id==data.userID)
      {
        this.allnoti.AllNotifications=this.allnoti.AllNotifications.filter(u=>u.id!=data.id);
      }
    })
  }
  public deleteTopic = () => {
    this.hubConnection.on("TopicDelete", (data) =>{
      let temp:Topic[]=[];
      this.forum.topics.forEach(u=>{
        if(u.id!=data)
        {
          temp.push(u)
        }
      })
      this.forum.topics=temp;
      //console.log(data)
    })
  }
  public insertTopic = () => {
    this.hubConnection.on("AddTopic", (data)=>{
      data.autor=data.user.firstName+" "+data.user.lastName;
      this.forum.topics.push(data);
      //console.log(data);
    })
  }
  public insertComment= () =>{
    this.hubConnection.on("insertComment", (data:TopicDetails)=>{
      data.autor=data.user.firstName+" "+data.user.lastName;
      data.likes=0;
      data.isLiked=false;
      data.lClass="";
      this.forum.AllComets.forEach(u=>{
        if(u.topicid==data.topicID)
        {
          data.position=u.comments.length;
        }
      })
      data.EdditTogle=false;
      data.isEditing=false
      data.Replies=[];
      //console.log(data);
      this.forum.AllComets.forEach(u=>{
        if(u.topicid==data.topicID)
        {
          u.comments.push(data);
        }
      })
      
      // this.forum.AllComets.forEach(u=>{
      //   if(u.topicid==data.topicID)
      //   {
      //     u.comments.push(data);
      //   }
      // })
    })
  }
  public deleteComment = () =>{
    this.hubConnection.on("deleteComment",(data)=>{
      //console.log(data);
      this.forum.AllComets.forEach(x=>{
        x.comments=x.comments.filter(u=>u.id!=data);
      })
    })
  }
  
  public LikeOrDislike = () =>{
    this.hubConnection.on("LikeDiseLike",(data)=>{
      //console.log(data);
      this.forum.AllComets.forEach(comms=>{
        comms.comments.forEach(u=>{
          if(u.id==data.id)
          {
              if(data.response)
              {
                u.likes+=1;
              }else
              {
                u.likes-=1;
              }
            
          }
        })
      })
    })
  }

  public EditComment = () =>{
    this.hubConnection.on("EditComment",(data)=>{
      //console.log(data);
      this.forum.AllComets.forEach(comms=>{
        comms.comments.forEach(u=>{
          if(u.id==data.id)
          {
            u.comment=data.newbody
          }
        })
      })
    })
  }

  public insertReply = () =>{
    this.hubConnection.on("insertReply",(data:Replies)=>{
      //console.log(data);
      this.forum.AllComets.forEach(allcoms=>{
        //console.log(allcoms.comments)
        allcoms.comments.filter(u=>u.id==data.parent.id).forEach(com=>{
          data.autor=data.user.firstName+" "+data.user.lastName;
          data.isLiked=false;
          data.lClass="";
          data.likes=0;
          data.position=com.Replies.length;
          data.EdditTogle=false;
          data.isEditing=false;
          com.Replies.push(data)
          //console.log(com)
        })
        //console.log(temp)
      })
    })
  }

  public deleteReply = () =>{
    this.hubConnection.on("deleteReply",(data)=>{
      //console.log(data);
      this.forum.AllComets.forEach(allcoms=>{
        //console.log(allcoms)
        allcoms.comments.filter(u=>u.id==data.parentID).forEach(com=>{
          com.Replies=com.Replies.filter(x=>x.id!=data.id);
          //console.log(com)
        })
      })
    })
  }

  public editReply = () =>{
    this.hubConnection.on("editReply",(data)=>{
      //console.log(data);
      this.forum.AllComets.forEach(allcoms=>{
        allcoms.comments.forEach(coms=>{
          coms.Replies.forEach(reps=>{
            if(reps.id=data.id)
            {
              reps.comment=data.newbody
              reps.EdditTogle=false;
              reps.isEditing=false;
            }
          })
        })
      })
    })
  }

  public LikeOrDislikeRep = () =>{
    this.hubConnection.on("LikeOrDislikeRep",(data:Hublikes)=>{
    //console.log(data);
    this.forum.AllComets.forEach(allcoms=>{
      allcoms.comments.forEach(coms=>{
        coms.Replies.forEach(reps=>{
          if(reps.id==data.id)
          {
            if(data.response)
            {
              reps.likes+=1;
            }
            else
            {
              reps.likes-=1;
            }
          }
        })
      })
    })
    //   this.forum.AllComets.forEach(allcoms=>{
    //     allcoms.comments.forEach(coms=>{
    //       coms.Replies.filter(u=>u.id==data.id).forEach(x=>{
    //         console.log(x);
    //         if(data.response)
    //         {
    //           x.likes+=1;
    //         }else
    //         {
    //           x.likes-=1;
    //         }
    //       })
    //     })
    //   })
    // })
  })

}
public editTopic = () =>{
  this.hubConnection.on("editTopic",(data)=>{
    //console.log(data);
    this.forum.topics.filter(u=>u.id==data.id).forEach(x=>{
      x.description=data.newbody;
    })
  })
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

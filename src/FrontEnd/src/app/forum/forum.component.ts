import { DatePipe, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { isatty } from 'tty';
import { ForumGlobal } from '../_globalVariables/ForumGlobal';
import { TopicDetails } from '../_models/TopicDetails';
import { Topic } from '../_models/Topics';
import { User } from '../_models/users';
import { TestUser } from '../_models/userSend';
import { AccountService } from '../_services/account.service';
import { ForumHubServiceService } from '../_services/forum-hub-service.service';
import { ForumService } from '../_services/forum.service';
import { NotificationService } from '../_services/notification.service';
import { PresenceService } from '../_services/presence.service';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit {

  constructor(private http: HttpClient,private forumService: ForumService,public accountService: AccountService,
    private fb:FormBuilder,private forumHub: ForumHubServiceService,private toster:ToastrService,private hub:PresenceService,
    private notiService: NotificationService,
    private translate : TranslateService)
  {

  }
  hubUrl = environment.hubUrl;
  public titlErrMsg:string="";
  public descErrMsg:string="";
  public curUsr:any;
  public forum= ForumGlobal;
  //public comments:TopicDetails[]=[];
  //public topics:Topic[] = ForumGlobal.topics;
  public role:any;
  public isAdmin:boolean=false;
  topicForm=this.fb.group({
    title:[''],
    description:[''],
    userID: ['']
  });
  ngOnInit(): void {
    if(sessionStorage.getItem('user')!=null)
    {
      this.accountService.setToken();
      this.accountService.curentUser$.subscribe(x=>{
        this.curUsr=x?.id;
        var token = JSON.parse(sessionStorage?.getItem('user')!);
        if(token)
        {
          let decoderJWT = JSON.parse(window.atob(token?.split('.')[1]));
          this.role = decoderJWT["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          if(this.role=="1"){
            this.isAdmin=true;
          }
        }
      })
      if(this.isAdmin)
      {
        let GetUser:any;
        this.accountService.curentUser$.subscribe(x=>{
          GetUser=x;
        })
      }

    }
    if(this.forum.topics.length==0)
    {
      this.forumService.GetAllTopics().subscribe(x=>{
        x.forEach(u=>{
            u.autor=u.user.firstName+" "+u.user.lastName;
            u.isEditing=false;
          this.forum.topics.push(u);
          // let comments:TopicDetails[]=[];
          // this.forumService.getTopicComment(+this.forum.topics[this.forum.topics.length-1].id).subscribe(x=>{
          //   x.forEach(u=>{
          //     u.autor=u.user.firstName+" "+u.user.lastName;
          //     this.forumService.getCommentLikes(+u.id).subscribe(lk=>{
          //       u.likes=lk.length;
          //     })
          //     if(this.curUsr!=null)
          //     {
          //       this.forumService.isItLiked(this.curUsr,+u.id).subscribe(x=>{
          //         u.isLiked=x;
          //         if(u.isLiked){
          //           u.lClass="isLiked"
          //         }else{
          //           u.lClass=""
          //         }
          //       })
          //     }

          //     u.position=comments.length;
          //     u.isEditing=false;
          //     u.EdditTogle=false;
          //     this.forumService.GetAllReplies(+u.id).subscribe(replies=>{
          //       var tempPosition: number=0;
          //       u.Replies=replies;
          //       u.Replies?.forEach(rep=>{
          //         rep.autor=rep.user.firstName+" "+rep.user.lastName;
          //         this.forumService.getReplyLikes(+rep.id).subscribe(lk=>{
          //           rep.likes=lk.length;
          //         })
          //         rep.isEditing=false;
          //         rep.EdditTogle=false;
          //         if(this.curUsr!=null)
          //         {
          //           this.forumService.isItLikedReply(this.curUsr,+rep.id).subscribe(x=>{
          //             rep.isLiked=x;
          //             if(rep.isLiked)
          //             {
          //               rep.lClass="isLiked"
          //             }
          //             else
          //             {
          //               rep.lClass=""
          //             }
          //           })
          //         }
          //         rep.position=tempPosition;
          //         tempPosition+=1;
          //       })
          //     })

          //     comments.push(u);
          //   })
          //   this.forum.AllComets.push({
          //     topicid:+u.id,
          //     comments:comments
          //   });

          // },error=>{
          // })
        })
      },error=>{
        console.log(error);
      })
    }



  }

  submit(){
    let errorToggle: boolean = false;
    //console.log(this.topicForm.value)
    if(this.topicForm.value.title.length==0)
    {
      this.titlErrMsg="Please enter title of your topic!";
      errorToggle=true;
    }
    else
    {
      this.titlErrMsg="";
    }
    if(this.topicForm.value.description.trim().length==0)
    {
      this.descErrMsg="Please enter description of your topic!";
      errorToggle=true;
    }
    else
    {
      this.descErrMsg="";
    }

    if(!errorToggle)
    {
      this.titlErrMsg="";
      this.descErrMsg="";
      this.forumService.InsertTopic(this.topicForm.value).subscribe(x=>{
        this.forum.AllComets.push({
          topicid:+x.id,
          comments:[]
        })

        this.forum.topics.filter(y=>y.id==x.id).forEach(temp=>{
          temp.isEditing=false;
        })
        //console.log(this.forum.topics);
      },error=>{
      //console.log(error);
      })
      this.topicForm.get('title')?.setValue("");
      this.topicForm.get('description')?.setValue("");
    }



  }
  // public showForumSpinner = false;
  deleteTopic(event: any)
  {
    // this.showForumSpinner = true;
    let id = event.target.id;
    let tempTopics:Topic[]=[];
    this.forum.topics.forEach(u=>{
      if(u.id!=id)
      {
        tempTopics.push(u);
      }
    })
    this.forum.topics=tempTopics;


    this.forumService.GetTopic(id).subscribe(x=>{
      if(this.curUsr!=x.userID)
      {
        let noti = {
          notification: "Your topic has been deleted",
          routerLink: "test",
          userID: x.userID,
          user: TestUser
        }
        this.notiService.insertNotif(noti).subscribe();
      }

    })
    this.forumService.DeleteTopic(id).subscribe();
    // this.showForumSpinner = false;
  }
  testtt()
  {
   // console.log(this.forum.AllComets);
  }
}


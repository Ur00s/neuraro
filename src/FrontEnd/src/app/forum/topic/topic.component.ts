import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ForumGlobal } from 'src/app/_globalVariables/ForumGlobal';
import { AllComments } from 'src/app/_models/AllComments';
import { TopicDetails } from 'src/app/_models/TopicDetails';
import { Topic } from 'src/app/_models/Topics';
import { AccountService } from 'src/app/_services/account.service';
import { ForumService } from 'src/app/_services/forum.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  public curUsr:any;
  public topicID:any;
  //public topic!: Topic;
  public forum = ForumGlobal;
  public EditCommetCheckToggle:boolean=true;
  public noBodyErr: string="";
  public nocomments:string="No comments on this topic";
  //public comments: TopicDetails[]=[];
  commentForm=this.fb.group({
    userID:[''],
    topicID:[''],
    comment:['']
  });
  ReplycommentForm=this.fb.group({
    userID:[''],
    parentID:[''],
    comment:['']
  });
  constructor(private hub: PresenceService,private forumService: ForumService,public accountService: AccountService,private activatedRoute: ActivatedRoute,private fb: FormBuilder) { }

  ngOnInit(): void {


    this.accountService.curentUser$.subscribe(x=>{
      this.curUsr=x?.id;
    })

    this.topicID = this.activatedRoute.snapshot.params['topicid'];
    this.commentForm.get('topicID')?.setValue(this.topicID);
    this.commentForm.get('userID')?.setValue(this.curUsr);
    //this.ReplycommentForm.get('topicID')?.setValue(this.topicID);
    this.ReplycommentForm.get('userID')?.setValue(this.curUsr);

    this.forumService.GetTopic(this.topicID).subscribe(x=>{
      this.accountService.getUser(+x.userID).subscribe(u=>{
        x.autor=u.result.firstName+" "+u.result.lastName;

      })
      x.isEditing=false;
      this.forum.topics.filter(u=>u.id==this.topicID).push(x)
    })
    let comments:TopicDetails[]=[];
    this.forumService.getTopicComment(+this.topicID).subscribe(x=>{
      x.forEach(u=>{
        u.autor=u.user.firstName+" "+u.user.lastName;
        this.forumService.getCommentLikes(+u.id).subscribe(lk=>{
          u.likes=lk.length;
        })
        if(this.curUsr!=null)
        {
          this.forumService.isItLiked(this.curUsr,+u.id).subscribe(x=>{
            u.isLiked=x;
            if(u.isLiked){
              u.lClass="isLiked"
            }else{
              u.lClass=""
            }
          })
        }

        u.position=comments.length;
        u.isEditing=false;
        u.EdditTogle=false;
        this.forumService.GetAllReplies(+u.id).subscribe(replies=>{
          var tempPosition: number=0;
          u.Replies=replies;
          u.Replies?.forEach(rep=>{
            rep.autor=rep.user.firstName+" "+rep.user.lastName;
            this.forumService.getReplyLikes(+rep.id).subscribe(lk=>{
              rep.likes=lk.length;
            })
            rep.isEditing=false;
            rep.EdditTogle=false;
            if(this.curUsr!=null)
            {
              this.forumService.isItLikedReply(this.curUsr,+rep.id).subscribe(x=>{
                rep.isLiked=x;
                if(rep.isLiked)
                {
                  rep.lClass="isLiked"
                }
                else
                {
                  rep.lClass=""
                }
              })
            }
            rep.position=tempPosition;
            tempPosition+=1;
          })
        })

        comments.push(u);
      })
      this.forum.AllComets = this.forum.AllComets.filter(u=>u.topicid!=this.topicID);
      this.forum.AllComets.push({
        topicid:+this.topicID,
        comments:comments
      });

    },error=>{
    })
    if(this.forum.topics.length==0)
    {
      this.forumService.GetAllTopics().subscribe(x=>{
        x.forEach(u=>{
            u.autor=u.user.firstName+" "+u.user.lastName;
            u.isEditing=false;
            //console.log(u);
          this.forum.topics.push(u);
        })
      },error=>{
        console.log(error);
      })
    }
    //console.log(this.forum.topics); 
  }

  DeleteReplies(event:any,position:number)
  {
    this.forum.AllComets.forEach(comments=>{
      if(comments.topicid==this.topicID)
      {
        comments.comments[position].Replies = [];
        comments.comments[position].Replies = event;
      }
    })

  }


  GetReplies(event: any,position:number)
  {
    //console.log(event)
    this.forum.AllComets.forEach(commnets=>{
      if(commnets.topicid==this.topicID)
      {
        commnets.comments[position].Replies[event.RepPosition]!.isLiked!=event.LikeOrDislike;
    if(event.LikeOrDislike)
    {
      commnets.comments[position].Replies[event.RepPosition]!.lClass="isLiked";
      //commnets.comments[position].Replies[event.RepPosition]!.likes+=1;
    }
    else
    {
      commnets.comments[position].Replies[event.RepPosition]!.lClass="";
      //commnets.comments[position].Replies[event.RepPosition]!.likes-=1;
    }
      }

    })

  }
  editCommentCheck(event: any)
  {
    if(event.target.value.length==0)
    {
      this.EditCommetCheckToggle=false;
    }
    else
    {
      this.EditCommetCheckToggle=true;
    }
  }
  submit(){

    this.forumService.InsertComment(this.commentForm.value).subscribe(x=>{
      // this.accountService.getUser(+x.userID).subscribe(usr=>{
      //   x.autor=usr.result.firstName+" "+usr.result.lastName;
      // })
      // this.forumService.getCommentLikes(+x.id).subscribe(lk=>{
      //   x.likes=lk.length;
      // })
      // x.isLiked=false;
      // x.lClass="";
      // x.position=this.comments.length;
      // x.EdditTogle=false;
      // x.isEditing=false;
      // x.Replies=[];
      // this.nocomments="";
      // this.forum.AllComets.forEach(comms=>{
      //   if(comms.topicid==this.topicID)
      //   {
      //     comms.comments.push(x);
      //   }
      // })
      // //this.forum.AllComets.push(x);
    })
    this.commentForm.get('comment')?.setValue("");
   }


   Replysubmit(event: any)
   {
     this.ReplycommentForm.get('parentID')?.setValue(event.target.id);
    let position:number;
    this.forum.AllComets.forEach(comments=>{
      if(comments.topicid==this.topicID)
      {
        comments.comments.forEach(u=>{
          if(u.id==event.target.id)
           {
            position=u.position;
          }
        })
        this.forumService.InsertReply(this.ReplycommentForm.value).subscribe(x=>{

          // this.accountService.getUser(+x.userID).subscribe(usr=>{
          //   x.autor=usr.result.firstName+" "+usr.result.lastName;
          // })

          // this.forumService.getReplyLikes(+x.id).subscribe(lk=>{
          //   x.likes=lk.length;
          // })

          // x.isLiked=false;
          // x.lClass="";
          // x.position=comments.comments[position].Replies.length;
          // x.EdditTogle=false;
          // x.isEditing=false;
          // comments.comments[position].Replies.push(x);
        })
      }
    })

    this.ReplycommentForm.get('parentID')?.setValue("");
    this.ReplycommentForm.get('comment')?.setValue("");
   }

  LD(event: any){
     var temp:string=event.srcElement.className;
     var id=event.target.id;
     var position:number;
     this.forum.AllComets.forEach(comments=>{
       if(comments.topicid==this.topicID)
       {
         comments.comments.forEach(u=>{
           if(u.id==id)
           {
             position=u.position;
           }
         })
         this.forumService.isItLiked(this.curUsr,id).subscribe(x=>{
          this.forumService.LikeDislike(this.curUsr,id,!x).subscribe(like=>{
             if(like)
             {
               comments.comments[position].lClass="isLiked";
               //comments.comments[position].likes+=1;
             }
             else
             {
               comments.comments[position].lClass="";
               //comments.comments[position].likes-=1;
             }
          })
        })
       }
     })



  }
  deleteCom(event: any){
    let comments!: TopicDetails[];
    this.forum.AllComets.forEach(comments=>{
      if(comments.topicid==this.topicID)
      {
        let id = event.target.id;
        //var temp =this.comments.find(obj=> obj.id==id)?.position!;
        let tempCom:TopicDetails[]=[];
        comments.comments.forEach(u=>{
          if(u.id!=id)
          {
            tempCom.push(u);
          }
        })
        comments.comments=tempCom;
        this.forumService.DeleteComment(id).subscribe();
        if(comments.comments.length===0)
        {
          this.nocomments="No comment on this topic";
        }
      }
    })

  }
  editComOpen(event: any)
  {
    let id = event.target.id;
    this.forum.AllComets.forEach(comments=>{
      if(comments.topicid==this.topicID)
      {
        comments.comments.forEach(u=>{
          if(u.id==id)
          {
            comments.comments[u.position].isEditing=true;
            comments.comments[u.position].EdditTogle=true;
          }
          else
          {
            comments.comments[u.position].EdditTogle=false;
          }
        })
      }
    })

  }

  cancelEdit(event: any)
  {
    let id = event.target.id;
    this.forum.AllComets.forEach(comments=>{
      if(comments.topicid==this.topicID)
      {
        comments.comments.forEach(u=>{
          if(u.id==id)
          {
            comments.comments[u.position].isEditing=false;
          }
        })
      }
    })
  }
  editCom(event:any)
  {
    let id = event.target.id;
    let newComment = ((document.getElementById("inp"+id.toString()) as HTMLInputElement).value);
    this.forumService.EditComment(id,newComment).subscribe(x=>{
      if(x)
      {
        this.forum.AllComets.forEach(comments=>{
          if(comments.topicid==this.topicID)
          {
            comments.comments.forEach(u=>{
              if(u.id==id)
              {
                comments.comments[u.position].comment=newComment;
                comments.comments[u.position].isEditing=false;
                //this.comments[u.position].EdditTogle=false;
              }
            })
          }
        })

      }
    })

  }
  editTopic()
  {
    this.forum.topics.filter(u=>u.id==this.topicID).forEach(topic=>{
      topic.isEditing=true;
    })
  }
  editTopicChange()
  {
    //let id = this.topic.id
    let newBody = ((document.getElementById("txta") as HTMLInputElement)?.value);
    let trimm = newBody.trim();
        if(trimm?.length==0)
        {
          this.noBodyErr="Please enter description of your topic!";
        }
        else
        {
          this.noBodyErr="";
          this.forum.topics.filter(u=>u.id==this.topicID).forEach(topic=>{
            this.forumService?.EditTopic(this.topicID,newBody).subscribe(x=>{
              if(x)
              {
                //this.topic.description=newBody;
                topic.isEditing=false;
              }
            });
          })

        }

  }
  cancelTopicEditing()
  {
    this.forum.topics.forEach(topic=>{
      if(topic.id==this.topicID)
      {
        topic.isEditing=false;
        this.noBodyErr=""
      }
    })
  }
}

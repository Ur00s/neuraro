import { Component, Input, OnInit } from '@angular/core';
import { Replies } from 'src/app/_models/Replies';
import { TopicDetails } from 'src/app/_models/TopicDetails';
import { AccountService } from 'src/app/_services/account.service';
import { ForumService } from 'src/app/_services/forum.service';
import { EventEmitter,Output } from '@angular/core';

@Component({
  selector: 'app-replies',
  templateUrl: './replies.component.html',
  styleUrls: ['./replies.component.scss']
})
export class RepliesComponent implements OnInit {

  @Output() emitReplies = new EventEmitter<any>();
  @Output() emitDelete = new EventEmitter<any>();

  @Input() reply: Replies[]=[];
  @Input() Parent!: TopicDetails;
  @Input() curUsr!: number;
  
  public EditCommetCheckToggle:boolean=true;
  constructor(private forumService: ForumService,public accountService:AccountService) { }

  ngOnInit(): void {
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

  deleteCom(event:any)
  {
    let id = event.target.id; 
    //var temp =this.comments.find(obj=> obj.id==id)?.position!;
    let tempCom:Replies[]=[];
    let position:number = 0;
    this.reply.forEach(u=>{
      if(u.id!=id)
      {
        u.position = position;
        tempCom.push(u);
        position += 1;
      }
    })
    this.reply=tempCom;
    this.forumService.DeleteReply(id).subscribe();
    this.emitDelete.emit(this.reply);
  }

  editComOpen(event:any)
  {
    let id = event.target.id;
    this.reply.forEach(u=>{
      if(u.id==id)
      {
        this.reply[u.position].isEditing=true;
        this.reply[u.position].EdditTogle=true;
      }
      else
      {
        this.reply[u.position].EdditTogle=false;
      }
    })
  }
  editCom(event:any)
  {
    let id = event.target.id;
    let newReply = ((document.getElementById("inp"+id.toString()) as HTMLInputElement).value);
    this.forumService.EditReply(id,newReply).subscribe(x=>{
      // if(x)
      // {
      //   this.reply.forEach(u=>{
      //     if(u.id==id)
      //     {
      //       this.reply[u.position].comment=newReply;
      //       this.reply[u.position].isEditing=false;
      //       //this.comments[u.position].EdditTogle=false;
      //     }
      //   })
      // }
    })
    //this.emitReplies.emit(this.reply);
  }
  cancelEdit(event:any)
  {
    let id = event.target.id;
    this.reply.forEach(u=>{
      if(u.id==id)
      {
        this.reply[u.position].isEditing=false;
      }
    })
  }
  LD(event:any)
  {
    var id=event.target.id;
    var position:number;
    this.reply.forEach(u=>{
      if(u.id==id)
      {
        position=u.position;
      }
    })
    this.forumService.isItLikedReply(this.curUsr,id).subscribe(x=>{
      this.forumService.LikeDislikeReply(this.curUsr,id,!x).subscribe(like=>{
        if(like)
        {
          this.reply[position]?.lClass!="isLiked";
          //this.reply[position]?.likes!=this.reply[position]?.likes+1;
        }
        else
        {
          this.reply[position]?.lClass!="";
          //this.reply[position]?.likes!=this.reply[position]?.likes-1;
          
        }
        let temp = {
          LikeOrDislike: like,
          RepPosition: position
        }
        this.emitReplies.emit(temp)
      })
    })
  }
}

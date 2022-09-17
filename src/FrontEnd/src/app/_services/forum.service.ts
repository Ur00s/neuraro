import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminChange } from '../_models/AdminChanges';
import { Profile } from '../_models/Profile';
import { User } from '../_models/users';
import { environment } from 'src/environments/environment';
import { Topic } from '../_models/Topics';
import { TopicDetails } from '../_models/TopicDetails';
import { likes } from '../_models/Likes';
import { AccountService } from './account.service';
import { TestReply, TestTopic, TestUser } from '../_models/userSend';
import { Replylikes } from '../_models/ReplyLikes';
import { Replies } from '../_models/Replies';
import { PresenceService } from './presence.service';
import { NotificationService } from './notification.service';
import { NotificationsGlobal } from '../_globalVariables/NotificationsGlobal';

const httpOptions = { 
  headers : new HttpHeaders({
  'Content-Type' : 'application/json'
})};
@Injectable({
  providedIn: 'root'
})
export class ForumService {
  baseUrl = environment.backendUrl;
  hubUrl = environment.hubUrl;
  private allnoti = NotificationsGlobal;
  constructor(private http: HttpClient,private accountService: AccountService,private hub: PresenceService,private notiService:NotificationService) { }
  private token = this.accountService.setToken();
  GetAllTopics(): Observable<Topic[]>{
    return this.http.get<Topic[]>(this.baseUrl+"topic");
  }
  GetTopic(id: number): Observable<Topic>{
    return this.http.get<Topic>(this.baseUrl+"topic/"+id);
  }
  InsertTopic(model: any): Observable<Topic>{
    model.userID = model.userID as number;
    model.user=TestUser;
    return this.http.post<Topic>(this.baseUrl+"topic/insert",model,{headers : this.token});
  }
  DeleteTopic(id: number): Observable<boolean>{
    let topicid = JSON.stringify(id);
    let temp = {
      id:id,
      connectionId:this.hub.connectionId
    }
    
    //this.hub.deleteTopic();
    return this.http.post<boolean>(this.baseUrl+"topic/delete",temp,{headers : this.token});
  }
  EditTopic(id:number,newdesc: string):Observable<boolean>{
    let newBody = JSON.stringify(newdesc);
    return this.http.post<boolean>(this.baseUrl+"topic/edit/"+id,newBody,{headers : this.token});
  }
  getTopicComment(id: number): Observable<TopicDetails[]>{
    return this.http.get<TopicDetails[]>(this.baseUrl+"topic/comments/"+id,{headers : this.token});
  }
  getCommentLikes(id: number): Observable<likes[]>{
    return this.http.get<likes[]>(this.baseUrl+"topic/likes/"+id,{headers : this.token});
  }
  InsertComment(model: any): Observable<TopicDetails>{
    model.user=TestUser;
    model.topic=TestTopic;
    return this.http.post<TopicDetails>(this.baseUrl+"topic/insert/comment",model,{headers : this.token});
  }
  isItLiked(uid:number,cid: number): Observable<boolean>{
    return this.http.get<boolean>(this.baseUrl+"topic/isLiked/"+uid+"/"+cid,{headers : this.token})
  }
  LikeDislike(uid:number,cid: number,likeOrNot:boolean): Observable<boolean>{
    return this.http.get<boolean>(this.baseUrl+"topic/like/"+uid+"/"+cid+"/"+likeOrNot,{headers : this.token});
  }
  DeleteComment(id:number): Observable<boolean>{
    //this.hub.deleteComment();
    return this.http.get<boolean>(this.baseUrl+"topic/delete/comment/"+id,{headers : this.token});
  }
  EditComment(id:number,newComment:string): Observable<boolean>{
    let comment = JSON.stringify(newComment);
    //this.hub.EditComment();
    return this.http.post<boolean>(this.baseUrl+"topic/comment/edit/"+id,comment,{headers : this.token});
  }
  //Replies
  GetAllReplies(id:number): Observable<any>{
    return this.http.get<any>(this.baseUrl+"replies/"+id);
  }
  isItLikedReply(uid:number,pid: number): Observable<boolean>{
    return this.http.get<boolean>(this.baseUrl+"replies/isLiked/"+uid+"/"+pid,{headers : this.token})
  }
  LikeDislikeReply(uid:number,pid: number,likeOrNot:boolean): Observable<boolean>{
    return this.http.get<boolean>(this.baseUrl+"replies/like/"+uid+"/"+pid+"/"+likeOrNot,{headers : this.token});
  }
  getReplyLikes(id: number): Observable<Replylikes[]>{
    return this.http.get<Replylikes[]>(this.baseUrl+"replies/likes/"+id,{headers : this.token});
  }
  DeleteReply(id:number): Observable<boolean>{
    return this.http.get<boolean>(this.baseUrl+"replies/delete/"+id,{headers : this.token});
  }
  EditReply(id:number,newReply:string): Observable<boolean>{
    let reply = JSON.stringify(newReply);
    return this.http.post<boolean>(this.baseUrl+"replies/edit/"+id,reply,{headers : this.token});
  }
  InsertReply(model: any): Observable<Replies>{
    model.user=TestUser;
    model.parent=TestReply;
    return this.http.post<Replies>(this.baseUrl+"replies/insert/",model,{headers : this.token});
  }
}

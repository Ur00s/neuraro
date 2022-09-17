import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HeapInfo } from 'v8';
import { AccountService } from './account.service';
import { PresenceService } from './presence.service';
import { TrainHubService } from './train-hub.service';

@Injectable({
  providedIn: 'root'
})
export class GooglesigninService {
  private auth2!: gapi.auth2.GoogleAuth
  private subject = new ReplaySubject<gapi.auth2.GoogleUser>(1);
  constructor(private accService: AccountService,private router: Router,private presence: PresenceService,private chartHub: TrainHubService) {
    gapi.load('auth2',()=>{
      this.auth2 = gapi.auth2.init({
        client_id: environment.GoogleId
      })
    })
   }
   
   public signIn()
   {
     this.auth2.signIn({

     }).then(user=>{
        let token:any = user.getAuthResponse().id_token;
        const usr:any={
          firstName: user.getBasicProfile().getGivenName(),
          lastName: user.getBasicProfile().getFamilyName(),
          username: user.getBasicProfile().getEmail().split("@")[0],
          email: user.getBasicProfile().getEmail()
        }
        this.accService.googleCheck(usr).subscribe(x=>{
          if(x){
            this.accService.googleLogin(usr).subscribe(response=>{
              this.presence.insertComment();
              this.presence.deleteTopic();
              this.presence.insertTopic();
              this.presence.deleteComment();
              this.presence.LikeOrDislike();
              //this.presence.EditCom();
              this.presence.EditComment();
              this.presence.insertReply();
              this.presence.deleteReply();
              this.presence.LikeOrDislikeRep();
              this.presence.editReply();
              this.presence.editTopic();
              this.chartHub.TrainRespone();
              this.router.navigate(["/playground"]);
            })
          }
          else{
            this.accService.googleRegister(usr).subscribe(x=>{
              this.accService.googleLogin(usr).subscribe(response=>{
                this.presence.insertComment();
                this.presence.deleteTopic();
                this.presence.insertTopic();
                this.presence.deleteComment();
                this.presence.LikeOrDislike();
                //this.presence.EditCom();
                this.presence.EditComment();
                this.presence.insertReply();
                this.presence.deleteReply();
                this.presence.LikeOrDislikeRep();
                this.presence.editReply();
                this.presence.editTopic();
                this.chartHub.TrainRespone();
                this.router.navigate(["/playground"]);
              })
            });
            
          }
        })
        //console.log(usr);
        this.subject.next(user);
     }).catch(()=>{
       this.subject.next(null!);
     })
   }
  //  const usr:any= {
  //   id:decoderJWT['id'],
  //   firstName: decoderJWT['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'].split(" ")[0],
  //   lastName: decoderJWT['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'].split(" ")[1],
  //   username: decoderJWT['http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname'],
  //   email: decoderJWT['email'],
  //   token: token
  // }
   public signOut() {
     this.auth2.signOut().
     then(()=>{
        this.subject.next(null!);
     })
   }
   public observable(): Observable<gapi.auth2.GoogleUser>{
     return this.subject.asObservable();
   }
}

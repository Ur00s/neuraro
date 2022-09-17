import { HttpClient } from '@angular/common/http';
import { isNgTemplate, ThisReceiver } from '@angular/compiler';
import { ChangeDetectorRef, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { User } from './_models/users';
import { AccountService } from './_services/account.service';
import { Title } from '@angular/platform-browser';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { GlobalVariable } from './_globalVariables/globalVariable';
import { DOCUMENT } from '@angular/common';
import { PresenceService } from './_services/presence.service';
import { TrainHubService } from './_services/train-hub.service';
import { GooglesigninService } from './_services/googlesignin.service';
import { NotificationService } from './_services/notification.service';
import { TestUser } from './_models/userSend';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Igrannonica';
  private user: any;
  public isGoogleUser!:boolean;
  private glob = GlobalVariable;
  constructor( public accountService: AccountService, private titleService:Title,private presence: PresenceService,private chartHub: TrainHubService
   ,private signInService: GooglesigninService, private ref: ChangeDetectorRef,private notifiService: NotificationService, public translate: TranslateService){
    translate.addLangs(['en', 'sr']);
    translate.setDefaultLang(localStorage.getItem('language') as string);
   }

  public globalClass = GlobalVariable;
  public usersOnline = PresenceService;

  ngOnInit() {

    if(localStorage.getItem('language') == null)
    {
      localStorage.setItem('language', 'en');
    }

    if(sessionStorage.getItem('isGoogleUser'))
    {
      this.isGoogleUser=JSON.parse(sessionStorage.getItem('isGoogleUser')!);
      this.glob.isGoogleUser=this.isGoogleUser;
    }
    this.signInService.observable().subscribe(user=>{
      this.user=user;
      this.ref.detectChanges()
    })
    this.titleService.setTitle("Igrannonica");
    this.setCurentuser();
    if(sessionStorage.getItem('user')!=null)
    {
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
      this.presence.insertNotifi(this.user);
      this.presence.deleteNotifi(this.user);
    }
  }
  setIsGoogleUser(event:any)
  {
    this.isGoogleUser=event;
  }
  
  setCurentuser(){
    if(sessionStorage.getItem('user'))
    {

    var token = JSON.parse(sessionStorage.getItem('user')!);
    let decoderJWT = JSON.parse(window.atob(token.split('.')[1]));
    let temp = decoderJWT['id'];
    let img;
    this.accountService.GetUserPhoto(temp).subscribe(x=>{
      img=x.imageUrl;
      //console.log(img!)
    });
    const usr:any= {
      id:decoderJWT['id'],
      firstName: decoderJWT['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'].split(" ")[0],
      lastName: decoderJWT['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'].split(" ")[1],
      username: decoderJWT['http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname'],
      email: decoderJWT['email'],
      token: token,
      imageUrl: decoderJWT['image']
    }
    this.user=usr;
    //console.log(usr);
    this.accountService.setCurrentUser(usr as User);
    this.presence.createHubConnection(usr);
    this.chartHub.createHubConnection(usr);
    }


  }
}

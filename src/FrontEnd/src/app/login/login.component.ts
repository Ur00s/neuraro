import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PresenceService } from '../_services/presence.service';
import { TrainHubService } from '../_services/train-hub.service';
import { GooglesigninService } from '../_services/googlesignin.service';
import { NotificationService } from '../_services/notification.service';
import { NotificationsGlobal } from '../_globalVariables/NotificationsGlobal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Output() user = new EventEmitter<any>();
  public errorMsg: string="";
  errUn:string = "";
  errPa:string = "";
  model:any={};
  public allnoti = NotificationsGlobal
  constructor(private presence: PresenceService,private chartHub: TrainHubService,private accountService: AccountService,private router: Router,
    private signInService: GooglesigninService,private notiService:NotificationService, private translate: TranslateService) { }

  ngOnInit(): void {
    if(sessionStorage.getItem("user"))
    {
      this.router.navigate(["/"])
    }
  }
  signIn () {
    this.showSpinnerLogin = true;
    this.signInService.signIn();
  }
  signOut() {
    this.signInService.signOut()
  }
  public showSpinnerLogin = false;
  login(){

    this.errorMsg=this.errPa=this.errUn="";
    var check:boolean=true;
    if(this.model.username==""){
      this.errUn=this.translate.instant("script1.p1");
      check=false;
    }if(this.model.password==""){
      this.errPa=this.translate.instant("script1.p2");
      check=false;
    }

    if(check){
      this.showSpinnerLogin = true;
      this.accountService.login(this.model).subscribe(response=>{
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
      //console.log(usrrId!);

        this.router.navigate(["/playground"]);
      },error=>{
        this.errorMsg=this.translate.instant("script1.p3");
      });
    }

  }

}

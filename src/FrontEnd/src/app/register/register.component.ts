import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GooglesigninService } from '../_services/googlesignin.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  errFn: string = "";
  errLn: string = "";
  errEm: string = "";
  errUn: string = "";
  errPa: string = "";
  errCpa: string = "";
  errGen:string = "";
  model: any={};

  constructor(
    private accountService: AccountService,
    private router: Router,
    private toastr:ToastrService,
    private signInService: GooglesigninService,
    private translate : TranslateService
    ) { }

  ngOnInit(): void {
  }
  public showSpinner = false;
  register(){
    this.errFn=this.errLn=this.errEm=this.errUn=this.errPa=this.errCpa=this.errGen="";
    var check:boolean=true;
    var firstName=this.model.firstName;
    if(firstName=="" || firstName==null){
      this.errFn=this.translate.instant("script.p1");;
      check=false;
    }else if(!firstName.match(/^[A-Za-zĀ-ž]*$/)){
      this.errFn= this.translate.instant("script.p2");
        check=false;
      }

    var lastName=this.model.lastName;
    if(lastName=="" || lastName==null){
      this.errLn=this.translate.instant("script.p3");
      check=false;
    }else if(!lastName.match(/^[A-Za-zĀ-ž]*$/)){
        this.errLn=this.translate.instant("script.p4");
        check=false;
    }

    var email=this.model.email;
    if(email=="" || email==null){
      this.errEm=this.translate.instant("script.p5");
      check=false;
    }else if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)){
      this.errEm=this.translate.instant("script.p6");
      check=false;
    }

    var username = this.model.username;
    if(username=="" || username==null){
      this.errUn=this.translate.instant("script.p7");
      check=false;
    }else if(!username.match(/^[A-Za-z0-9Ā-ž]*$/)){
      this.errUn=this.translate.instant("script.p8");
      check=false;
    }
    var password = this.model.password;
    if(password==""|| password==null){
        this.errPa=this.translate.instant("script.p9");
        check=false;
    }else if(!password.match(/^(?=.*\d)(?=.*[a-zā-ž])(?=.*[A-ZĀ-Ž])(?=.*[a-zA-ZĀ-ž]).{8,}$/)){
          this.errPa=this.translate.instant("script.p10");
          check=false;
    }

    var checkPassword = this.model.checkpassword;
    if(checkPassword==""|| checkPassword==null){
      this.errCpa=this.translate.instant("script.p11");
      check=false;
    }

    if(password!=null && checkPassword!=null && password!=checkPassword){
      this.errCpa=this.translate.instant("script.p12");
      check=false;
    }
     if(check){
      this.showSpinner = true;
      delete this.model.checkpassword;
       this.accountService.register(this.model).subscribe(response=>{
         this.router.navigate(["/login"]);
       },error=>{
         this.errGen=error.error;
       })

     }

  }
  signIn () {
    this.showSpinner=true;
    this.signInService.signIn();
  }

}

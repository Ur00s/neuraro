import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs';
import { UserImage } from '../_globalVariables/UserImage';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  public passerror: string="";
  public PassChngBool: any;
  public user: any={};
  public avatar: any;
  public model: any={};
  public UserImage = UserImage;
  @Output() emitImage = new EventEmitter<any>();


  updateForm=this.fb.group({
    id:[''],
    firstName:[''],
    lastName:[''],
    Username:[''],
    Email:[''],
    Password:[''],
    cpass:['']
  });
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });
  public btnName : any =  "Change password";
  public btnClass : string = "btn btn-primary";
  constructor(public accountService: AccountService,private fb: FormBuilder,private router: Router,
     private toastr:ToastrService,
     private translate : TranslateService) {

  }


  ngOnInit(): void {

    this.accountService.setToken();
    this.PassChngBool=false;
    if(!sessionStorage.getItem('user')){
      this.router.navigate(["/"]);
    }
    if(sessionStorage.getItem('isGoogleUser'))
    {
      let temp = JSON.parse(sessionStorage.getItem('isGoogleUser')!)
      if(temp==true)
      {
        this.router.navigate(["/"]);
      }
    }
    let id:any;
     this.accountService.curentUser$.pipe(takeUntil(this.accountService.terminateSubscriptions)).subscribe(x=>id=x.id);
    this.accountService.getUser(+id).subscribe(x=>{
      //console.log(x)
      this.user=x.result;
      // this.accountService.curentUser$.subscribe(u=>this.user.imageUrl=u.imageUrl);
      this.avatar=this.user.firstName[0].toUpperCase()+this.user.lastName[0].toUpperCase();
    })
    //console.log(this.user);
  }

  submit(){
    const formData = new FormData();
    formData.append('file', this.myForm.get('fileSource') ?.value);
    //console.log(formData);
    this.accountService.UploadFile(formData,this.user.id).subscribe(x=>{
      if(x.changed)
      {
        this.accountService.GetUserPhoto(this.user.id).subscribe(x=>{
          //console.log(x);
          this.user.imageUrl=x.imageUrl;
          this.UserImage.image=x.imageUrl;
        })
      }
    },error=>console.log(error))
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.myForm.patchValue({
        fileSource: file
      });
    }
  }

  Validation(){
    var temp = this.updateForm.value;
    if(temp.Password==temp.cpass){
      return true;
    }else{
      return false;
    }
  }


  PassChng(){
    if(this.PassChngBool == true)
    {
      this.btnName = this.translate.instant('script1.p5');
      this.btnClass = "btn btn-primary";
    }
    else
    {
      this.btnName = "Close";
      this.btnClass = "btn btn-danger";
    }
    this.PassChngBool=!this.PassChngBool;
  }

  errorEmail:string = ""
  errorPass:string = ""

  check:boolean = false;

  UpdateChanges(chpass:number){
    // this.accountService.update(this.updateForm.value).subscribe(response=>{
    //   this.accountService.logout();
    //   var temp :any={
    //     username: this.updateForm.value.Username,
    //     password: this.updateForm.value.Password
    //   };
    //   console.log(temp);
    //   this.accountService.login(temp).subscribe(x=>{
    //     window.location.reload();
    //   });
    // },error=>{
    //   console.log(error);
    // })

    var email:any = this.updateForm.value.Email;
    var password:any = this.updateForm.value.Password;



    this.errorEmail = "";
    this.passerror = "";

    this.check = false;

    if(email == "" || email == null)
    {
      this.errorEmail = this.translate.instant("script.p5");
      this.check = true;
    }else if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
    {
      this.errorEmail = this.translate.instant("script.p6");
      this.check = true;
    }

    if((password == "" || password == null) && chpass == 1)
    {
      this.passerror = this.translate.instant("script.p9");
      this.check = true;
    }else if(chpass==1 && !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    {
      this.passerror = this.translate.instant("script.p10");
      this.check = true;
    }



    if(!this.check)
    {
      this.accountService.update(this.updateForm.value,chpass).subscribe(x=>{
        this.user=x;
        this.toastr.success(this.translate.instant("toster.p23"),this.translate.instant("toster.p1"),{
          timeOut:5000,
          closeButton:true,
          positionClass:'toast-top-center'
        })
      },error=>{
        console.log(error);
      })
    }


  }

  Changes(){
    if(!this.PassChngBool){
      delete this.updateForm.value.Password
      delete this.updateForm.value.cpass;
      this.UpdateChanges(0);
    }else{
      if(this.Validation()){
        this.passerror="";
        //delete this.updateForm.value.cpass;
        this.UpdateChanges(1);
      }else{
        this.passerror=this.translate.instant("script.p12");
      }
    }


  }
  cancelPage(){
    this.router.navigate(["/"]);
  }

}

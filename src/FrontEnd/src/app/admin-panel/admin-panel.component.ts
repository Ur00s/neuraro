import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../_models/users';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  public forms:any[]=[];
  public users: User[]=[];
  public role:any;
  baseUrl="https://localhost:5001/";
  public AdminOrNot:any;
  constructor(private http:HttpClient,private accountService: AccountService,private router: Router,private fb: FormBuilder) { }

  ngOnInit(): void {
      this.accountService.setToken();
      var token = JSON.parse(sessionStorage?.getItem('user')!);
      let decoderJWT = JSON.parse(window.atob(token?.split('.')[1]));
      this.role = decoderJWT["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if(this.role!="1"){
        this.router.navigate(["/"]);
      }
    this.accountService.getAllUsers().subscribe(users=>{
      users.forEach(u=>{
        if(u.role=="0"){
          u.PD="Promote"
        }else if(u.role=="1"){
          u.PD="Demote";
        }
        u.editInput=false;
        u.editText=true;
        u.editing=false;
        u.editingTitle="Edit Data";
        this.users.push(u);
      })
    })
  }


  Delete(event:any){
    var userId:BigInteger = event.target.id;
    this.accountService.delete(userId).subscribe(users=>{
      this.users=[];
      users.forEach(u=>{
        if(u.role=="0"){
          u.PD="Promote"
        }else if(u.role=="1"){
          u.PD="Demote";
        }
        u.editInput=false;
        u.editText=true;
        u.editing=false;
        u.editingTitle="Edit Data";
        this.users.push(u);
      })
    })
  }


  RoleChange(event:any){
    var userId:BigInteger = event.target.id;
    var PDusers: User;
    this.users.forEach(u=>{
      if(u.id==userId){
        PDusers=u;
      }
    });
    if(PDusers!.role=="0"){
      PDusers!.role="1";
    }else{
      PDusers!.role="0";
    }
    this.accountService.PromoteDemote(userId,PDusers!.role).subscribe(users=>{
      this.users=[];
      users.forEach(u=>{
        if(u.role=="0"){
          u.PD="Promote"
        }else if(u.role=="1"){
          u.PD="Demote";
        }
        u.editInput=false;
        u.editText=true;
        u.editing=false;
        u.editing=false;
        u.editingTitle="Edit Data";
        this.users.push(u);
      })
    })
  }
  errorFirstName:string = ""
  errorLastName:string = ""
  errorUserName:string = ""
  errorEmail:string = ""
  
  check:boolean = true;

  EditUser(event:any){
    //console.log(this.users);
    var userId:BigInteger = event.target.id;
    
    var PDusers: User;
    this.users.forEach(u=>{
      if(u.id==userId){
        u.editText=!u.editText;
        u.editInput=!u.editInput;
        u.editing=!u.editing;
        if(u.editing==true){
          u.editingTitle="Cancel"
        }else if(u.editing==false){
          u.editingTitle="Edit Data"
          this.errorFirstName = "";
          this.errorLastName = "";
          this.errorUserName = "";
          this.errorEmail = "";          
        }
      }
    });

  }

 


  FormEdit(event: any){
    var userId:number = event.target.id;
    
    var fn = ((document.getElementById("fn"+userId.toString()) as HTMLInputElement).value);
    var ln = ((document.getElementById("ln"+userId.toString()) as HTMLInputElement).value);
    var un = ((document.getElementById("un"+userId.toString()) as HTMLInputElement).value);
    var em = ((document.getElementById("em"+userId.toString()) as HTMLInputElement).value);
    var tempArray={
      id:userId,
      firstName:fn,
      lastName:ln,
      username:un,
      email:em
    }

    this.errorFirstName = "";
    this.errorLastName = "";
    this.errorUserName = "";
    this.errorEmail = "";
    this.check = true;


    if(tempArray.firstName=="" || tempArray.firstName==null)
    {
      this.errorFirstName="Enter first name!";
      this.check=false;
    }else if(!tempArray.firstName.match(/^[A-Za-zĀ-ž]*$/))
    {
      this.errorFirstName="First name can only contain letters!";
      this.check=false;
    }

   
    if(tempArray.lastName=="" || tempArray.lastName==null){
      this.errorLastName="Enter last name!";
      this.check=false;
    }else if(!tempArray.lastName.match(/^[A-Za-zĀ-ž]*$/)){
        this.errorLastName="Last name can only contain letters!";
        this.check=false;
    }

    if(tempArray.username=="" || tempArray.username==null){
      this.errorUserName="Enter username!";
      this.check=false;
    }else if(!tempArray.username.match(/^[A-Za-z0-9Ā-ž]*$/)){
      this.errorUserName="Username can only contain letters and numbers!";
      this.check=false;
    }

    
    if(tempArray.email=="" || tempArray.email==null){
      this.errorEmail="Enter email!";
      this.check=false;
    }else if(!tempArray.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)){
      this.errorEmail="Wrong email format!";
      this.check=false;
    }


    if(this.check)
    {
      this.accountService.update(tempArray,0).subscribe(users=>{
        this.users=[];
        this.accountService.getAllUsers().subscribe(users=>{
          users.forEach(u=>{
            if(u.role=="0"){
              u.PD="Promote"
            }else if(u.role=="1"){
              u.PD="Demote";
            }
            u.editInput=false;
            u.editText=true;
            u.editing=false;
            u.editingTitle="Edit Data";
            //var tempid: number= +u.id;
            this.users.push(u);
          })
        })
      })
    }
    else
    {
      return;
    }
    
    
    
    // this.accountService.AdminUpdate(tempArray,userId).subscribe(users=>{
    //   console.log(users);
    // },error=>{
    //   console.log(error);
    // })
  }



}

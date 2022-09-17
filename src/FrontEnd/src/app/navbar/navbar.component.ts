import { DOCUMENT } from '@angular/common';
import { Token } from '@angular/compiler';
import { Component, HostListener, Inject, Input, OnInit, Renderer2, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { async } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { AdminPanelComponent } from '../admin-panel/admin-panel.component';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { ContactComponent } from '../contact/contact.component';
import { ForumComponent } from '../forum/forum.component';
import { TopicComponent } from '../forum/topic/topic.component';
import { LoginComponent } from '../login/login.component';
import { PagenotfoundComponent } from '../pagenotfound/pagenotfound.component';
import { FileProjectsComponent } from '../playground/file-projects/file-projects.component';
import { FilesComponent } from '../playground/files/files.component';
import { PlaygroundComponent } from '../playground/playground.component';
import { PredictionsComponent } from '../predictions/predictions.component';
import { ProfilePageComponent } from '../profile-page/profile-page.component';
import { RegisterComponent } from '../register/register.component';
import { GlobalVariable } from '../_globalVariables/globalVariable';
import { NotificationsGlobal } from '../_globalVariables/NotificationsGlobal';
import { UserImage } from '../_globalVariables/UserImage';
import { Model } from '../_models/model';
import { SavedFile } from '../_models/SavedFile';
import { Table } from '../_models/Table';
import { AccountService } from '../_services/account.service';
import { LoaderService } from '../_services/loader.service';
import { NotificationService } from '../_services/notification.service';
import { PresenceService } from '../_services/presence.service';
@Component({

  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  public role:string ="";
  public user: any;
  public name: string="";
  public userImg: any;
  public isAdmin:boolean=false;
  @Input() isGoogleUser!: boolean;
  theme: Theme = 'dark-theme';

  @HostListener('window:resize', ['$event'])
  onResize($event: any){
    this.ResizeWindowMethod();
  }
  constructor(private hub: PresenceService,public accountService: AccountService,  @Inject(DOCUMENT) private document: Document, private renderer:Renderer2,
  private notiService: NotificationService, public loaderService:LoaderService, public translate:TranslateService, private changeDetector:ChangeDetectorRef) {
  }
  public languageBool : boolean = false;
  public allnoti = NotificationsGlobal;
  public glob = GlobalVariable;
  public UserImage = UserImage;
  public savedLang : string = 'en';
  ngOnInit(): void {
    if(sessionStorage.getItem('user'))
    {
      let usrrId:number;
      this.accountService.curentUser$.pipe(takeUntil(this.accountService.terminateSubscriptions)).subscribe(x=>{
        usrrId=x.id;
      })
      //console.log(usrrId!);
      this.notiService.GetUserNotis(+usrrId!).subscribe(notifs=>{
        this.allnoti.AllNotifications=notifs;
        //console.log(notifs)
      })
    }
    if(sessionStorage.getItem('experimentName'))
    {
      this.glob.expName=sessionStorage.getItem('experimentName')!;
      this.glob.expCsv=sessionStorage.getItem('fileNameExp')!;

    }
    if(localStorage.getItem('language') == null)
    {
      localStorage.setItem('language', 'en');
      this.savedLang = 'en';
    }
    else
    {
      let langPreference : string = localStorage.getItem('language') as string;
      this.savedLang = langPreference;
      this.useLanguage1(langPreference);
    }

    if(localStorage.getItem('theme') == null)
    {
      localStorage.setItem('theme', 'dark-theme');
    }
    this.theme = localStorage.getItem('theme') as Theme;


    if(this.accountService.curentUser$.subscribe()!=null)
    {
      
      this.accountService.curentUser$.subscribe(x=>{
        if(x == null)
        {
          return;
        }
        this.user=x;
        this.ResizeWindowMethod();
        var token = JSON.parse(sessionStorage?.getItem('user')!);
        if(token)
        {
          let decoderJWT = JSON.parse(window.atob(token?.split('.')[1]));
          this.role = decoderJWT["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          if(this.role=="1"){
            this.isAdmin=true;
          }
        }
        this.accountService.GetUserPhoto(x.id).subscribe(u=>{
          //console.log(u.imageUrl);
          this.userImg=u.imageUrl;
          this.UserImage.image=u.imageUrl
        })
      });
    }

    //  if(this.user){
    //     this.ResizeWindowMethod();
    //  }
    this.initializeTheme();

  }
  public table = Table;
  public model= Model;
  closeTable()
  {
    this.model.ResetModel();
    //this.inputs = [];
    this.table.setShowTable(!this.table.getShowTable());
    this.table.inputs=[];
    this.table.output="";
    this.table.stats = [];
    sessionStorage.removeItem('data');
    sessionStorage.removeItem('stats');
    sessionStorage.removeItem('showTable');
    sessionStorage.removeItem('showSpinner');
    sessionStorage.removeItem('path');
    sessionStorage.removeItem('inputs');
    sessionStorage.removeItem('output');
    sessionStorage.removeItem('TableID');
    sessionStorage.removeItem('CurrentPage');
    sessionStorage.removeItem('RegularizationRate');
    sessionStorage.removeItem('LearningRate');
    sessionStorage.removeItem('Regularization');
    sessionStorage.removeItem('Dropout');
    sessionStorage.removeItem('Momentum');
    sessionStorage.removeItem('PreventLoss')
    sessionStorage.removeItem('nodeLayersArray');
    sessionStorage.removeItem('layersActivationFunctions');
    sessionStorage.removeItem('numLayers');
    sessionStorage.removeItem('TestToTrainRatio');
    sessionStorage.removeItem('Optimizer');
    sessionStorage.removeItem('NumEpochs');
    sessionStorage.removeItem('Noise');
    sessionStorage.removeItem('BatchSize')
    sessionStorage.removeItem('Status');
    sessionStorage.removeItem('ActivationFunction');
    sessionStorage.removeItem('encodings');
    sessionStorage.removeItem('experimentName');
    sessionStorage.removeItem('experimentID');
    sessionStorage.removeItem('BatchIndex');
    sessionStorage.removeItem('fileNameExp');
    this.glob.fileprojects=true;
    this.glob.data=false;
    this.glob.parameters=false;
    this.glob.models=false;
    this.glob.expName="";
    this.glob.expCsv="";
    sessionStorage.setItem('fileprojects',JSON.stringify(this.glob.fileprojects));
    sessionStorage.setItem('dataPage',JSON.stringify(this.glob.data));
    sessionStorage.setItem('parameters',JSON.stringify(this.glob.parameters));
    sessionStorage.setItem('models',JSON.stringify(this.glob.models));
  }
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges()
  }

  initializeTheme = (): void =>
  this.renderer.addClass(this.document.body, this.theme)

  switchTheme(){
    this.document.body.classList.replace(
      this.theme,
      this.theme === 'light-theme'
      ? (this.theme = 'dark-theme')
      : (this.theme = 'light-theme')
    );
    localStorage.setItem('theme', this.theme);
  }
  public useLanguage(language : any){

    let lang = language.target.value;
    this.translate.use(lang);
    this.savedLang = lang;
    localStorage.setItem('language', lang);
  }
  public useLanguage1(language : string){
    this.translate.use(language);
    this.savedLang = language;
    localStorage.setItem('language', language);
  }

  logout(){
    this.accountService.logout();
  }
  ResizeWindowMethod(){
    if(window.innerWidth>991){
      this.accountService.curentUser$.subscribe(x=>{
        this.name=x?.firstName[0].toUpperCase()+x?.lastName[0].toUpperCase();
      })
      //this.name=this.user?.firstName[0]+this.user?.lastName[0];
    }else{
      this.accountService.curentUser$.subscribe(x=>{
        this.name=x?.firstName+" "+x?.lastName;
      })
      // this.name=this.user?.firstName+" "+this.user?.lastName;
    }
  }
  public showNav=true;
  toggleNavBar(component:any) {
    this.toggleColor(component);
    if(component instanceof PagenotfoundComponent) {
       this.showNav = false;
    } else {
       this.showNav = true;
    }
 }
 public showToggle = true;
 public navBarColor : string = "";
 toggleColor(component:any){
   //
  if(component instanceof PlaygroundComponent || component instanceof ForumComponent || component instanceof TopicComponent
     || component instanceof ProfilePageComponent || component instanceof AdminPanelComponent || component instanceof ContactComponent
     || component instanceof RegisterComponent || component instanceof LoginComponent || component instanceof ChatbotComponent
     || component instanceof FileProjectsComponent || component instanceof PredictionsComponent)
    {
      this.navBarColor = "navbar-custom";
      this.showToggle = true;
    }
  else{
      this.navBarColor = "";
      this.showToggle = false;
 }

 }
 ClearAllNoti()
 {
   this.allnoti.AllNotifications.forEach(noti=>{
     //console.log(noti);
     this.notiService.DeleteNotifi(noti.id).subscribe();
   })
 }
}

export type Theme = 'light-theme' | 'dark-theme';

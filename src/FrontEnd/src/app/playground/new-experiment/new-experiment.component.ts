import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GlobalVariable } from 'src/app/_globalVariables/globalVariable';
import { Model } from 'src/app/_models/model';
import { SavedFile } from 'src/app/_models/SavedFile';
import { Table } from 'src/app/_models/Table';
import { AccountService } from 'src/app/_services/account.service';
import { ExperimentService } from 'src/app/_services/experiment.service';
import { PlaygroundService } from 'src/app/_services/playground.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-experiment',
  templateUrl: './new-experiment.component.html',
  styleUrls: ['./new-experiment.component.scss']
})
export class NewExperimentComponent implements OnInit {
  @Output() emitTable = new EventEmitter<any>();
  @Output() emitExpName = new EventEmitter<any>();
  @Output() emitExpCsv = new EventEmitter<any>();
  public files:SavedFile[]=[];
  constructor( private translate : TranslateService ,private fb:FormBuilder,public accountService: AccountService,private playgroundService:PlaygroundService, private experimentService: ExperimentService, private toastr:ToastrService) { }
  expForm=this.fb.group({
    experimentName:[''],
    experimentDescription:[''],
    file:[''],
    userID: ['']
  });
  public tableID:any;
  public table = Table;
  public model = Model;
  public glob = GlobalVariable;
  page: string[] = [];
  numPages!:number;
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });
  public selectedFile:any;

  ngOnInit(): void {
    if(sessionStorage.getItem('user'))
    {
      let userId;
      this.accountService.curentUser$.pipe(takeUntil(this.accountService.terminateSubscriptions)).subscribe(u=>{
        userId=u.id
      });
      this.expForm.get('userID')?.setValue(userId);
    }
    this.playgroundService.getAllFiles().subscribe(response=>{
      response.forEach(u=>{
        this.files.push(u);
        
      })
      this.selectedFile = this.files[0].id;
      //console.log(this.selectedFile)
    })

    // console.log(this.accountService.getJWTToken());
  }

  public showUploadSpinner = false;
  public errorMessage:string = "";
  @ViewChild('modalButton') myButton!:ElementRef<HTMLElement>;

  submitFile()
  {
    this.showUploadSpinner = true;
    //console.log(this.myForm);
    const formData = new FormData();
    formData.append('file', this.myForm.get('fileSource') ?.value);
    this.playgroundService.uploadFile(formData)
      .subscribe((res: any) => {
        this.files = [];
        this.playgroundService.getAllFiles().subscribe(res => {
            res.forEach(element => {
              this.files.push(element)
            });
          this.showUploadSpinner = false;
          let justUploadedFIleName = this.files[this.files.length - 1].fileName;

          this.toastr.success(this.translate.instant("toster.p18")+ justUploadedFIleName +this.translate.instant("toster.p19"),this.translate.instant("toster.p1"),{
            timeOut:2000,
            closeButton:true,
            positionClass:'toast-top-center'
          })

          this.myForm.get('file')?.setValue("");
          this.selectedFile = this.files[this.files.length-1].id
          //console.log(this.selectedFile);
        }, err => console.log(err));
      }, error => {
         this.errorMessage = error.error;
         this.toastr.error(this.translate.instant("toster.p6"),this.translate.instant("toster.p2"),{
          timeOut:10000,
          closeButton:true,
          positionClass:'toast-top-center'
        })
         this.showUploadSpinner = false;
         return;
      });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.myForm.patchValue({
        fileSource: file
      });
      this.submitFile();
    }
  }

  submit()
  {
    //console.log(this.expForm.value);

    if(this.expForm.value.experimentName == "" || this.expForm.value.experimentName == null)
    {
      this.errorMessage = this.translate.instant("toster.p20");
      this.toastr.error(this.errorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }
    
    if(sessionStorage.getItem('stats'))
    {
      this.table.stats = [];
      sessionStorage.removeItem('stats');
    }
    this.table.setShowTable(false);
    this.table.setShowSpinner(true);
    let id = parseInt(this.expForm.value.file);

    this.experimentService.createExperiment({
      "name": this.expForm.value.experimentName,
      "description": this.expForm.value.experimentDescription,
      "fileId": id
    }).subscribe((res: any) => {
      // console.log(res);
      this.emitExpName.emit(this.expForm.value.experimentName);
      let temp:SavedFile;
      this.files.forEach(u=>{
        if(u.id==id)
        {
          temp=u;
          sessionStorage.setItem('fileNameExp',u.fileName!);
        }
      })
      this.emitExpCsv.emit(temp!.fileName);
      sessionStorage.setItem("experimentID",res.created);
      //this.glob.expName=this.expForm.value.expName;
    }, (err: any) => {
      console.log(err);
    });

    this.playgroundService.loadTable(id).subscribe((res: any) => {
      this.table.setShowTable(true)
      this.table.setShowSpinner(false);
      this.table.data = res;
      this.table.data.numericColumns.forEach((element:any)=> {
        this.table.stats.push(element);
        
      });
      this.table.data.categoryStats.forEach((element:any)=> {
        this.table.stats.push(element);
      });
      this.table.setPath(this.files.find(file => file.id == id)?.filePath!);
      this.page = this.table.data?.data?.slice(0, 100);
      GlobalVariable.setNumPages(Math.ceil((this.table.data.rows)/100))
      this.numPages = GlobalVariable.getNumPages();
      this.emitTable.emit(res);
      let temp: string;
      sessionStorage.setItem('experimentName',this.expForm.value.experimentName);
      sessionStorage.setItem('path',JSON.stringify(this.table.getPath()));
      sessionStorage.setItem('data',JSON.stringify(this.table.data));
      sessionStorage.setItem('stats',JSON.stringify(this.table.stats));
      sessionStorage.setItem('showSpinner',JSON.stringify(this.table.getShowSpinner()))
      sessionStorage.setItem('showTable',JSON.stringify(this.table.getShowTable()));
      sessionStorage.setItem('TableID',id.toString());
      sessionStorage.setItem('CurrentPage',GlobalVariable.getCurrentPage().toString())
      sessionStorage.setItem('Status',JSON.stringify(false));
      sessionStorage.setItem('inputs',JSON.stringify([]));
      sessionStorage.setItem('output',"");
      sessionStorage.removeItem('encodings');
      sessionStorage.removeItem('output');
      this.table.inputs=[];
      this.table.output="";
      if(JSON.parse(sessionStorage.getItem('Status')!)==false)
      {
        this.model.SetModelDefault();
        sessionStorage.setItem('Status',JSON.stringify(true));
      }
      this.glob.data=true;
      if(this.glob.data==true)
      {
        this.glob.fileprojects=false;
        this.glob.parameters=false;
        this.glob.models=false;
      }
      this.glob.ChangeValues()
    }, err => console.log(err));
  }
  

}

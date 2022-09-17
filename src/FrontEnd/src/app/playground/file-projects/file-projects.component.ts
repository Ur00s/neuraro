import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SavedFile } from 'src/app/_models/SavedFile';
import { Table } from 'src/app/_models/Table';
import { AccountService } from 'src/app/_services/account.service';
import { PlaygroundService } from 'src/app/_services/playground.service';
import { GlobalVariable } from 'src/app/_globalVariables/globalVariable';
import { Model } from 'src/app/_models/model';
import { ExperimentService } from 'src/app/_services/experiment.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-file-projects',
  templateUrl: './file-projects.component.html',
  styleUrls: ['./file-projects.component.scss']
})
export class FileProjectsComponent implements OnInit {
  @Output() emitTable = new EventEmitter<any>();
  public files:SavedFile[]=[];
  public table = Table;
  public model = Model;
  public glob = GlobalVariable;
  public tableID:any;
  public experiments: any[] = [];
  page: string[] = [];
  numPages!:number;
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });
  @ViewChild('modalButton') myButton!:ElementRef<HTMLElement>;
  public errorMessage:string = "";

  constructor(public accountService: AccountService,private playgroundService:PlaygroundService, 
    private translate : TranslateService, private experimentService: ExperimentService, private toastr:ToastrService) {
    this.experimentService.getAllExperiments().subscribe((res) => this.experiments = res);
   }

  ngOnInit(): void {
    if(sessionStorage.getItem('TableID'))
    {
      this.tableID=sessionStorage.getItem('TableID');
    }
    this.playgroundService.getAllFiles().subscribe(response=>{
      response.forEach(u=>{
        this.files.push(u);
      })
    })
  }

  deleteFile(event:any)
  {
    let fileId= event.target.id;

    let currentlyLoadedFile = sessionStorage.getItem("TableID");

    // console.log(currentlyLoadedFile);
    // console.log(fileId);
    if(fileId == currentlyLoadedFile)
    {
      this.errorMessage = this.translate.instant("toster.p4");
      this.toastr.error(this.errorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }

    this.playgroundService.deleteFile(fileId).subscribe(x=>{
      if(x.deleted)
      {

        let temp:SavedFile[]=[];
        this.files.forEach(u=>{
          if(u.id!=fileId)
          {
            temp.push(u);
          }
        })
        this.files=temp;
      }
    })
  }



  deleteExperiment(event:any)
  {
    let expId= event.target.id;

    let currentlyActiveExperiment = sessionStorage.getItem("experimentID");

    // console.log(currentlyActiveExperiment);
    // console.log(expId);
    if(currentlyActiveExperiment == expId)
    {
      this.errorMessage = this.translate.instant("toster.p5");
      this.toastr.error(this.errorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }

    this.experimentService.deleteExperiments(expId).subscribe(x=>{
      if(x.deleted)
      {

        let temp:any[]=[];
        this.experiments.forEach(exp=>{
          if(exp.id!=expId)
          {
            temp.push(exp);
          }
        })
        this.experiments=temp;
      }
    })
  }

  public showUploadSpinner = false;
  submit() {
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
          this.myForm.get('file')?.setValue("");
        }, err => console.log(err));
      }, error => {
         this.errorMessage = "error.error",
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
      this.submit();
    }
  }
  loadTable(e: any) {
    if(this.tableID==parseInt(e))
    {
      
    }else
    {

    if(sessionStorage.getItem('stats'))
    {
      this.table.stats = [];
      sessionStorage.removeItem('stats');
    }
    // console.log(e.target.value);
    this.table.setShowTable(false);
    this.table.setShowSpinner(true);
    let id = parseInt(e);
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
}

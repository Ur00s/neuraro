import { Component, OnInit,} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Table } from 'src/app/_models/Table';
import { PlaygroundService } from 'src/app/_services/playground.service';
import { EventEmitter,Output } from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { SavedFile } from 'src/app/_models/SavedFile';
import { GlobalVariable } from 'src/app/_globalVariables/globalVariable';
import { concat, EMPTY } from 'rxjs';
import { Model } from 'src/app/_models/model';
import { AnyTxtRecord } from 'dns';
import { FileChangesService } from 'src/app/_services/file-changes.service';
import { CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  
  @Output() emitTable = new EventEmitter<any>();
  public table = Table;
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });

  public filterargs:string = ""
  page: string[] = [];
  currentPage: number;
  elements:Element[] = [];
  numPages:number;
  model= Model;
  files: SavedFile[] = [];
  filterargsStats:string = "";
  tableID:number;
  public showTableInputs: boolean[][] | any;
  public hideNAFillButton:boolean = true;
  public updateStats:boolean = false;
  encodings:any[] = [];

  constructor(private playground: PlaygroundService, private modalService: NgbModal, private fb: FormBuilder, private fileChangesService: FileChangesService, private toastr:ToastrService, private translate : TranslateService) {
    this.currentPage = GlobalVariable.getCurrentPage();
    this.numPages = GlobalVariable.getNumPages();
    this.tableID = Number(sessionStorage.getItem("TableID"));
   }

  ngOnInit(): void {
    //console.log("test");
    // this.playground.getAllFiles().subscribe(res => {
    //   res.forEach(element => {
    //     this.files.push(element)
    //   });
    // }, err => console.log(err));
    // console.log("TABLE FROM FILES")
    // console.log(Table.data);

    this.showTableInputs=new Array(101).fill(false).map(() => new Array(this.table.data.columns.length).fill(false));
    this.changePage();
    if(sessionStorage.getItem('data')!&&sessionStorage.getItem('showTable')!&&sessionStorage.getItem('showSpinner')!)
    {
      
      if(sessionStorage.getItem("encodings") != "[]" && sessionStorage.getItem("encodings") !="" && sessionStorage.getItem("encodings") != null)
      {
        let obj = JSON.parse(sessionStorage.getItem("encodings")!)
        //console.log(obj);
        this.encodings = obj;

        //console.log(this.encodings);
      }
      else
      {
        this.table.data.columns.forEach((element:any) => {
          //console.log(element)
            this.encodings.push({"columnName": element, "encodingMethod" : "none"})
        });
        //console.log(this.encodings);
        sessionStorage.setItem("encodings",JSON.stringify(this.encodings));
      }
      
      if(this.table.NotRefresh==false)
      {
      this.table.setShowTable(false);
      this.table.setShowSpinner(true);
      let id = +sessionStorage.getItem('TableID')!;
      
      this.playground.loadTable(id).subscribe((res: any) => {
        this.table.setShowTable(true)
        this.table.setShowSpinner(false);
        this.table.data = JSON.parse(sessionStorage.getItem('data')!);
        this.table.stats = JSON.parse(sessionStorage.getItem('stats')!);
        this.table.setPath(this.files.find(file => file.id == id)?.filePath!);

        //this.page = this.table.data?.data?.slice(0, 100);
        this.tableID = id;
        // this.playground.loadPageFromTo(this.tableID,1,101).subscribe((pageResult:any)=>{
        //   //console.table(pageResult);
        //   this.page = pageResult;
        // });
        GlobalVariable.setNumPages(this.table.data.pageNumber);
        this.numPages = GlobalVariable.getNumPages();

        this.emitTable.emit(JSON.parse(sessionStorage.getItem('data')!));
        let temp: string;
        //console.log(this.table.data);
        this.currentPage=Number(sessionStorage.getItem('CurrentPage')!);
        GlobalVariable.setCurrentPage(Number(sessionStorage.getItem('CurrentPage')!));
        this.changePage();
    }, err => console.log(err));
    this.table.NotRefresh=true;
      }

    }
  }

  pageChanged(event: any): void {
    //console.log(event);
    GlobalVariable.setCurrentPage(event);
    this.changePage();
    sessionStorage.setItem('CurrentPage',GlobalVariable.getCurrentPage().toString())
  }

  changePage()
  {
    this.showTableInputs = new Array(101).fill(false).map(() => new Array(this.table.data.columns.length).fill(false));
    let startItem;
    let endItem;
  
    startItem = (GlobalVariable.getCurrentPage() - 1) * 100;
    endItem = GlobalVariable.getCurrentPage() * 100;
    
    
    this.playground.loadPageFromTo(this.tableID,startItem,endItem).subscribe((pageResult:any)=>{
      //console.table(pageResult);
      this.page = pageResult;
    });
  }

  changePageManually()
  {
    let inputValue = Number((<HTMLInputElement>document.getElementById('pageInput')).value) ;
    if(inputValue <= 0 || inputValue > this.numPages)
    {
      (<HTMLInputElement>document.getElementById('pageInput')).value = String(this.currentPage);
      return;
    }

    GlobalVariable.setCurrentPage(inputValue);
    this.currentPage = GlobalVariable.getCurrentPage();
    this.changePage();
    sessionStorage.setItem('CurrentPage',GlobalVariable.getCurrentPage().toString())

  }


  changeFilter(event:any)
  {
    this.filterargs = event.target.value as string;
  }

  changeFilterStats(event:any)
  {
    this.filterargsStats = event.target.value as string;
  }

  get f() {
    return this.myForm.controls;
  }





  loadTable(e: any) {
    // console.log(e.target.value);
    this.table.setShowTable(false);
    this.table.setShowSpinner(true);
    let id = parseInt(e.target.value);
    this.playground.loadTable(id).subscribe((res: any) => {
      this.table.setShowTable(true)
      this.table.setShowSpinner(false);
      this.table.data = res;
      this.table.setPath(this.files.find(file => file.id == id)?.filePath!);
      this.page = this.table.data.data.slice(0, 100);
      GlobalVariable.setNumPages(Math.ceil((this.table.data.data.length)/100))
      this.numPages = GlobalVariable.getNumPages();
      this.emitTable.emit(res);
      let temp: string;
      //console.log(this.table.data);
      sessionStorage.setItem('path',JSON.stringify(this.table.getPath()));
      sessionStorage.setItem('data',JSON.stringify(this.table.data));
      sessionStorage.setItem('showSpinner',JSON.stringify(this.table.getShowSpinner()))
      sessionStorage.setItem('showTable',JSON.stringify(this.table.getShowTable()));
      sessionStorage.setItem('TableID',id.toString());
      sessionStorage.setItem('CurrentPage',GlobalVariable.getCurrentPage().toString())
      sessionStorage.setItem('Status',JSON.stringify(false));
      sessionStorage.setItem('inputs',JSON.stringify([]));
      sessionStorage.setItem('output',"");
      sessionStorage.removeItem('output');
      this.table.inputs=[];
      this.table.output="";
      if(JSON.parse(sessionStorage.getItem('Status')!)==false)
      {
        this.model.SetModelDefault();
        sessionStorage.setItem('Status',JSON.stringify(true));
      }

    }, err => console.log(err));
  }

  showHideChanges(event:any)
  {

   
    let idCoordinates = event.target.id
    let idSplit:string = idCoordinates.split(":");

    let i = Number(idSplit[0]);
    let j = Number(idSplit[1]);
    if(this.showTableInputs[i][j] == false)
    {
      this.showTableInputs=new Array(101).fill(false).map(() => new Array(this.table.data.columns.length).fill(false));
    }
     

    // console.table(i+" "+j);
    // console.log(GlobalVariable.getCurrentPage());
    this.showTableInputs[i][j] = !this.showTableInputs[i][j];
  }

  private checkNumeric(colName: string) {
    //console.log("adawd");
    for (let i = 0; i < this.table.data.numericColumns.length; i++) {
      if (colName.toLowerCase() === this.table.data.numericColumns[i].name.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  changeValue(event:any,i:number,j:number)
  {
    // console.log(event.target.chVal.value);
    // let currItem = GlobalVariable.getCurrentPage() * 100 + i;
    // console.log(currItem + " " + j);
    // console.log(sessionStorage.getItem("TableID"));

    let fileId = Number(sessionStorage.getItem("TableID"));
    let indexI = (GlobalVariable.getCurrentPage() - 1) * 100 + i;
    let indexJ = j;
    let changes = event.target.chVal.value;
    let colName =  this.table.data.columns[j];
    let numValue = Number(changes);

    if (this.checkNumeric(colName) && Number.isNaN(numValue)) {
      alert("This is a numeric column. You must enter a number");
      return;
    }

    let finalChange = null;

    if (Number.isNaN(numValue)) {
      finalChange = changes;
    } else {
      finalChange = numValue;
    }

    this.fileChangesService.changeFile({
      "fileID": fileId,
      "changes": finalChange,
      "indexI": indexI,
      "indexJ": indexJ
    }).subscribe(res => {
      this.changePage();
      this.showTableInputs[i][j] = false;
      let id = fileId;
      this.playground.loadTable(id).subscribe((res: any) => {
        this.table.setShowTable(true)
        this.table.setShowSpinner(false);
        this.table.data = res;
        this.table.setPath(this.files.find(file => file.id == id)?.filePath!);
        // this.page = this.table.data.data.slice(0, 100);
        // GlobalVariable.setNumPages(Math.ceil((this.table.data.data.length)/100))
        // this.numPages = GlobalVariable.getNumPages();
        this.emitTable.emit(res);
        let temp: string;
        Table.stats=[];
        Table.data = res;
        Table.data.numericColumns.forEach((element:any)=> {
          Table.stats.push(element);
          
        });
        Table.data.categoryStats.forEach((element:any)=> {
          Table.stats.push(element);
        });
        //console.log("TABLE FROM FILL VALUES")
        //console.log(Table.data);
        sessionStorage.setItem('stats',JSON.stringify(Table.stats));
        //console.log(this.table.data);
        sessionStorage.setItem('path',JSON.stringify(this.table.getPath()));
        sessionStorage.setItem('data',JSON.stringify(this.table.data));
        sessionStorage.setItem('showSpinner',JSON.stringify(this.table.getShowSpinner()))
        sessionStorage.setItem('showTable',JSON.stringify(this.table.getShowTable()));
        sessionStorage.setItem('TableID',id.toString());
        sessionStorage.setItem('CurrentPage',GlobalVariable.getCurrentPage().toString())
        sessionStorage.setItem('Status',JSON.stringify(false));
        sessionStorage.setItem('inputs',JSON.stringify([]));
        sessionStorage.setItem('output',"");
        sessionStorage.removeItem('output');
        this.table.inputs=[];
        this.table.output="";
        if(JSON.parse(sessionStorage.getItem('Status')!)==false)
        {
          this.model.SetModelDefault();
          sessionStorage.setItem('Status',JSON.stringify(true));
        }
  
      }, err => console.log(err));
    });
  }

  drop(event: CdkDragDrop<object[]>) {
    moveItemInArray(this.table.stats, event.previousIndex, event.currentIndex);
  }

  fixDecimals(num:number):number
  {
    let digits =  String(num).split(".")[0];
    if(Number(digits) == 0)
    {
      return parseFloat(num.toPrecision(3));
    }
    else
    {
      return parseFloat(num.toPrecision(digits.length+3));
    }

    
  } 

  refreshData(event:any)
  {
    
    // console.log(e.target.value);

    let id = Number(sessionStorage.getItem("TableID"));
    this.playground.loadTable(id).subscribe((res: any) => {
      this.table.data = res;
      this.table.setPath(this.files.find(file => file.id == id)?.filePath!);
      this.changePage();
      
      
      this.emitTable.emit(res);

      this.toastr.success(this.translate.instant("toster.p7"),this.translate.instant("toster.p1"),{
        timeOut:2000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      //console.log(this.table.data);

      if(JSON.parse(sessionStorage.getItem('Status')!)==false)
      {
        this.model.SetModelDefault();
        sessionStorage.setItem('Status',JSON.stringify(true));
      }
    });
    
  }

  refreshDataOutlierHandling(event:any)
  {
    
    // console.log(e.target.value);
    // this.table.setShowTable(false);
    let id = Number(sessionStorage.getItem("TableID"));
    this.playground.loadTable(id).subscribe((res: any) => {
      // this.table.setShowTable(true)
      this.table.data = res;
      this.table.setPath(this.files.find(file => file.id == id)?.filePath!);
      this.changePage();
      
      this.playground.loadTable(id).subscribe((res: any) => {
        this.table.setShowTable(true)
        this.table.setShowSpinner(false);
        this.table.data = res;
        this.table.setPath(this.files.find(file => file.id == id)?.filePath!);
        // this.page = this.table.data.data.slice(0, 100);
        // GlobalVariable.setNumPages(Math.ceil((this.table.data.data.length)/100))
        // this.numPages = GlobalVariable.getNumPages();
        this.emitTable.emit(res);
        let temp: string;
        Table.stats=[];
        Table.data = res;
        Table.data.numericColumns.forEach((element:any)=> {
          Table.stats.push(element);
          
        });
        Table.data.categoryStats.forEach((element:any)=> {
          Table.stats.push(element);
        });

        sessionStorage.setItem("stats",JSON.stringify(Table.stats));
        this.updateStats = !this.updateStats;
      })
      
      this.emitTable.emit(res);

      this.toastr.success(this.translate.instant("toster.p8"),this.translate.instant("toster.p1"),{
        timeOut:2000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      //console.log(this.table.data);

    });
    
  }

  
  setEncoding(event: any, i: number) {

    this.encodings[i].encodingMethod = event.target.value;
    sessionStorage.setItem('encodings', JSON.stringify(this.encodings));
    // console.log(this.encodings);
  }

  hideFillNAbutton():boolean{
    for(let i = 0; i < this.table.stats.length; i++) {
      if (this.table.stats[i].numberOfNan > 0) {
        return true;
      }
    }
    return false;
  }
}

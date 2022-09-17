import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Table } from 'src/app/_models/Table';
import { PlaygroundService } from 'src/app/_services/playground.service';
import { EventEmitter,Output } from '@angular/core';
import { FilesComponent } from '../files/files.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {

  @Output() emitInputs = new EventEmitter<string[]>();
  @Output() emitOutputs = new EventEmitter<string>();
  @Output() emitEncoding = new EventEmitter<string>();
  @Output() emitEncodings = new EventEmitter<any[]>();

  @Input() inputs: any;
  @Input() output: any;
  @Input() encodingMethod: any;
  
  //public encodings: any[] = [];

  public table = Table;
  // public inputs: string[] = [];
  // public output: string = "";
  // public encodingMethod: string = "";

  public pearsonOrKendall:boolean = true;
  public corrMatrixHeaderText:string = "Pearson Correlation Matrix";


  constructor(private translate : TranslateService ,private playground: PlaygroundService, private modalService: NgbModal, private fb: FormBuilder, private toastr:ToastrService) { }
  //@ViewChild(FilesComponent) filecomp!: FilesComponent
  ngOnInit(): void {
    //this.inputs=this.table.inputs;
    this.table.data = JSON.parse(sessionStorage.getItem('data')!)
    if(sessionStorage.getItem('inputs'))
    {
      this.table.inputs=JSON.parse(sessionStorage.getItem('inputs')!);
    }
    if(sessionStorage.getItem('output'))
    {
      this.table.output=sessionStorage.getItem('output')!;
      this.output=sessionStorage.getItem('output')!;
    }
    
    //console.log(this.table.inputs)
    if(this.table.inputs.length==0)
    {
      let temp:string[] = [];
      this.table.encodings=[];
      for (let index = 0; index < this.table.data.columns.length-1; index++) {
        temp.push(this.table.data.columns[index]);
          if(this.notNumericColumn(this.table.data.columns[index]))
          {
            this.table.encodings.push({"columnName" : this.table.data.columns[index], "encodingMethod" : "binaryencoder"});
          }
        
        
      }
      // if(!sessionStorage.getItem('encodings'))
      // {
      //   sessionStorage.setItem('encodings',JSON.stringify(this.table.encodings));
      // }
      //console.log(this.table.encodings)
      //console.log(temp);
      this.table.inputs=temp;
      sessionStorage.setItem('inputs',JSON.stringify(temp));
    }
    if(this.table.output=="")
    {
      this.table.output=this.table.data.columns[this.table.data.columns.length-1];
      this.output=this.table.output;
      sessionStorage.setItem('output',this.table.output);
    }
    //console.log(this.table.output);
    if(sessionStorage.getItem('encodings'))
    {
      //this.table.encodings=[];
      //console.log(JSON.parse(sessionStorage.getItem('encodings')!));
      this.table.encodings=JSON.parse(sessionStorage.getItem('encodings')!);
      //console.log(this.table.encodings);
    }
  }

  addToInputs(event:any,input: string) {
    if(input == this.table.output)
    {
      event.target.checked = 0;
      this.toastr.error(this.translate.instant("toster.p21"),this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }


    if (event.target.checked) {
      //this.inputs.push(input);
      this.table.inputs.push(input);
      sessionStorage.setItem('inputs',JSON.stringify(this.table.inputs));
      this.emitInputs.emit(this.table.inputs);
      if(this.notNumericColumn(input)) {
        this.table.encodings.push({"columnName" : input, "encodingMethod" : "binaryencoder"});
      }
    } else {
      
      //this.inputs = this.inputs.filter((str:string) => str != input);
      this.table.inputs=this.table.inputs.filter((str:string) => str != input);
      sessionStorage.setItem('inputs',JSON.stringify(this.table.inputs));
      this.emitInputs.emit(this.table.inputs);
      this.table.encodings = this.table.encodings.filter(en => en.columnName != input);
    }

    this.emitEncodings.emit(this.table.encodings);
  }

  check(res:any)
  {
    //console.log(res);
  }
  selectOutput(e: any) {
    this.table.output = e.target.value;
    sessionStorage.setItem('output',this.table.output);
    this.emitOutputs.emit(this.table.output);
  }
  checkIfSelected(val: any) {

    if (this.table.inputs.indexOf(val) == -1) {
      return true;
    } else {
      return false;
    }
    
  }
  setNewEncodingMethdon(e: any) {
    this.encodingMethod = e.target.value;
    this.emitEncoding.emit(this.encodingMethod);
    
  }

  setEncodingForColumn(e:any, columnName: string) {
    let encoding = e.target.value;
    for (let i = 0; i < this.table.encodings.length; i++) {
      if (this.table.encodings[i].columnName === columnName) {
        this.table.encodings[i].encodingMethod = encoding;
      }
    }
    sessionStorage.setItem('encodings',JSON.stringify(this.table.encodings));
    this.emitEncodings.emit(this.table.encodings);
  }

  private notNumericColumn(columnName: string) {
    let numericColumns = this.table.data.numericColumns;
    for (let i = 0; i < numericColumns.length; i++) {
      if (numericColumns[i].name === columnName) {
        return false;
      }
    }

    return true;
  }

  public pearsonKendallChange()
  {
    if(this.pearsonOrKendall == true)
    {
      this.pearsonOrKendall = false;
      this.corrMatrixHeaderText = "Kendall Correlation Matrix";
    }
    else
    {
      this.pearsonOrKendall = true;
      this.corrMatrixHeaderText = "Pearson Correlation Matrix";
    }
  }

}

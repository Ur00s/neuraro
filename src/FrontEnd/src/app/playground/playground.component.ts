import {
  HttpClient
} from '@angular/common/http';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ElementRef,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ModalDismissReasons,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ChartOptions,
  ChartData
} from 'chart.js';
import {
  PlaygroundService
} from '../_services/playground.service';
import {
  GlobalVariable
} from '../_globalVariables/globalVariable';
import {
  baseColors
} from 'ng2-charts';
import {
  reduce
} from 'rxjs';
import {
  ANNTraining
} from '../_models/ANNTraining';
import {
  Table
} from '../_models/Table';
import {
  VariableEncode
} from '../_models/VariableEncode';
import { Layer } from '../_models/Layer';
import { AccountService } from '../_services/account.service';
import { Model } from '../_models/model';
import { FilesComponent } from './files/files.component';
import { SavedFile } from '../_models/SavedFile';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})

export class PlaygroundComponent implements OnInit {
  public Test:boolean= false;
  public Test1:boolean=true;
  public table = Table;
  public FileData: any;
  //public inputs: string[] = [];
  public output: string = "";
  public encodingMethod: string = "";
  public encodings: any[] = [];
  public glob = GlobalVariable
  private ExpName!:string;
  private ExpCsvName!:string;
  public isGoogleUser!: boolean;
  @Output() emitGoogleUser = new EventEmitter<boolean>();
  @Output() emitExpName = new EventEmitter<any>();
  @Output() emitExpCsvName = new EventEmitter<any>();
  GetTable(event: any)
  {
    this.FileData=event;
    this.table.data=this.FileData;
  }
  GetInputs(event: any)
  {
    this.table.inputs=event;
    //this.table.inputs = this.inputs;
  }
  GetOutputs(event: any)
  {
    this.output=event;
    this.table.output = this.output;
  }
  GetEncoding(event: any)
  {
    this.encodingMethod=event
  }
  GetEncodings(event: any) {
    this.encodings = event;
  }
  GetExpName(event:any)
  {
    this.ExpName=event;
    this.emitExpName.emit(event);
    this.glob.expName=event;
  }
  GetExpCsv(event:any)
  {
    this.ExpCsvName=event;
    this.emitExpCsvName.emit(event);
    this.glob.expCsv=event;
  }
  public model= Model;
  constructor(private playground: PlaygroundService, private modalService: NgbModal, private fb: FormBuilder, public accountService:AccountService,
    private cdref: ChangeDetectorRef) {}
  @ViewChild(FilesComponent) filecomp!: FilesComponent;
  ngOnInit(): void {
    if(sessionStorage.getItem('isGoogleUser'))
    {
      this.isGoogleUser=JSON.parse(sessionStorage.getItem('isGoogleUser')!);
      this.glob.isGoogleUser=this.isGoogleUser;
      this.emitGoogleUser.emit(this.isGoogleUser);
    }
    if(!sessionStorage.getItem('fileprojects'))
    {
      this.glob.DefaultPage();
    }else
    {
      this.glob.fileprojects=JSON.parse(sessionStorage.getItem('fileprojects')!)
      this.glob.data=JSON.parse(sessionStorage.getItem('dataPage')!)
      this.glob.parameters=JSON.parse(sessionStorage.getItem('parameters')!)
      this.glob.models=JSON.parse(sessionStorage.getItem('models')!)
      // if(this.glob.parameters==true||this.glob.models==true)
      // {
      //   if(!this.table.NotRefresh)
      //   this.filecomp?.ngOnInit();
      // }
    }
    if(JSON.parse(sessionStorage.getItem('Status')!)==false)
      {
        this.model.SetModelDefault();
        sessionStorage.setItem('Status',JSON.stringify(true));
      }
    if(sessionStorage.getItem('data'))
    {
      //this.test=JSON.parse(sessionStorage.getItem('showTable')!)
      this.table.setShowTable(JSON.parse(sessionStorage.getItem('showTable')!))
      this.table.setShowSpinner(JSON.parse(sessionStorage.getItem('showSpinner')!))
      this.table.data=(JSON.parse(sessionStorage.getItem('data')!));
      this.table.setPath(JSON.parse(sessionStorage.getItem('path')!))
    }
    if(sessionStorage.getItem('inputs'))
          {
            this.table.inputs=JSON.parse(sessionStorage.getItem('inputs')!);
          }
          if(sessionStorage.getItem('output'))
          {
            this.table.output=sessionStorage.getItem('output')!;
          }
          if(sessionStorage.getItem('encodings'))
          {
            this.table.encodings=JSON.parse(sessionStorage.getItem('encodings')!)
          }
  }
  ngAfterContentChecked()
  {
    this.cdref.detectChanges();
  }
  fileprojectsOpen()
  {
    this.glob.fileprojects=true;
    if(this.glob.fileprojects==true)
    {
      this.glob.data=false;
      this.glob.parameters=false;
      this.glob.models=false;
    }
    this.glob.ChangeValues()
  }
  dataOpen()
  {
    this.glob.data=true;
    if(this.glob.data==true)
    {
      this.glob.fileprojects=false;
      this.glob.parameters=false;
      this.glob.models=false;
    }
    this.glob.ChangeValues()
  }
  parametersOpen()
  {
    this.glob.parameters=true;
    if(this.glob.parameters==true)
    {
      this.glob.fileprojects=false;
      this.glob.data=false;
      this.glob.models=false;
    }
    this.glob.ChangeValues()
  }
  modelsOpen()
  {
    this.glob.models=true;
    if(this.glob.models==true)
    {
      this.glob.fileprojects=false;
      this.glob.data=false;
      this.glob.parameters=false;
    }
    this.glob.ChangeValues()
  }
  NextPage(page:number)
  {
    if(page==1)
    {
      this.parametersOpen();
    }
    else if(page==2)
    {
      this.modelsOpen();
    }
    else if(page==0)
    {
      this.dataOpen();
    }
  }
  // closeTable() {
  //   this.model.ResetModel();
  //   //this.inputs = [];
  //   this.table.setShowTable(!this.table.getShowTable());
  //   this.table.inputs=[];
  //   this.table.output="";
  //   this.table.stats = [];
  //   sessionStorage.removeItem('data');
  //   sessionStorage.removeItem('stats');
  //   sessionStorage.removeItem('showTable');
  //   sessionStorage.removeItem('showSpinner');
  //   sessionStorage.removeItem('path');
  //   sessionStorage.removeItem('inputs');
  //   sessionStorage.removeItem('output');
  //   sessionStorage.removeItem('TableID');
  //   sessionStorage.removeItem('CurrentPage');
  //   sessionStorage.removeItem('RegularizationRate');
  //   sessionStorage.removeItem('LearningRate');
  //   sessionStorage.removeItem('Regularization');
  //   sessionStorage.removeItem('Dropout');
  //   sessionStorage.removeItem('Momentum');
  //   sessionStorage.removeItem('PreventLoss')
  //   sessionStorage.removeItem('nodeLayersArray');
  //   sessionStorage.removeItem('layersActivationFunctions');
  //   sessionStorage.removeItem('numLayers');
  //   sessionStorage.removeItem('TestToTrainRatio');
  //   sessionStorage.removeItem('Optimizer');
  //   sessionStorage.removeItem('NumEpochs');
  //   sessionStorage.removeItem('Noise');
  //   sessionStorage.removeItem('BatchSize')
  //   sessionStorage.removeItem('Status');
  //   sessionStorage.removeItem('ActivationFunction');
  //   sessionStorage.removeItem('encodings');
  //   sessionStorage.removeItem('experimentName');
  //   sessionStorage.removeItem('experimentID');
  //   sessionStorage.removeItem('BatchIndex');
  //   sessionStorage.removeItem('fileNameExp');
  //   this.glob.fileprojects=true;
  //   this.glob.data=false;
  //   this.glob.parameters=false;
  //   this.glob.models=false;
  //   this.glob.expName="";
  //   this.glob.expCsv="";
  //   sessionStorage.setItem('fileprojects',JSON.stringify(this.glob.fileprojects));
  //   sessionStorage.setItem('dataPage',JSON.stringify(this.glob.data));
  //   sessionStorage.setItem('parameters',JSON.stringify(this.glob.parameters));
  //   sessionStorage.setItem('models',JSON.stringify(this.glob.models));
  // }
}

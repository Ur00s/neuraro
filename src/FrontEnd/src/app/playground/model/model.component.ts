import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Table } from 'src/app/_models/Table';
import { PlaygroundService } from 'src/app/_services/playground.service';
import { EventEmitter,Output } from '@angular/core';
import { GlobalVariable } from 'src/app/_globalVariables/globalVariable';
import { ANNTraining } from 'src/app/_models/ANNTraining';
import { VariableEncode } from 'src/app/_models/VariableEncode';
import { Layer } from 'src/app/_models/Layer';
import { ThisReceiver } from '@angular/compiler';
import { Model } from 'src/app/_models/model';
import { throws } from 'assert';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {

  @Input() inputs: any;
  @Input() output: any;
  @Input() encodingMethod: any;
  @Input() encodings: any;
  public data1:any;
  public data2:any;
  @Output() emitData1 = new EventEmitter<any>();
  @Output() emitData2 = new EventEmitter<any>();
  public table = Table;
  public ann = ANNTraining;
  public model = Model;
  public TestToTrainRatio: any = this.model.TestToTrainRatio;
  public Noise: any = this.model.Noise;
  public BatchSize: any = this.model.BatchSize;
  public RegularizationRate: any = this.model.RegularizationRate;
  public ActivationFunction: any = this.model.ActivationFunction;
  public LearningRate: any = this.model.LearningRate;
  public Dropout: any = this.model.Dropout;
  public Momentum: any = this.model.Momentum;
  public PreventLoss: any = this.model.PreventLoss;
  public Optimizer:any = this.model.Optimizer;
  public NumEpochs:any = this.model.NumEpochs;
  public numLayers: number = this.model.numLayers;
  public nodeLayersArray: Array < number > = this.model.nodeLayersArray;
  public toEncode: any[] = this.model.toEncode;
  public layers: Layer[] = this.model.layers;
  public layersActivationFunctions: string[] = this.model.layersActivationFunctions;
  public Regularization:any = this.model.Regularization;
  public disableRegInput?:boolean;
  public disableMomentumInput?:boolean;
  public validationPass:boolean = false;
  public problemType: any = this.model.ProblemType;

  public batchSizePowerArray:number[] = [2,4,8,16,32,64,128];


  public globalClass = GlobalVariable;

  

  public neuralNetworkModel = this.fb.group({
    problemType:[''],
    learningRate: [''],
    activationFunction: [''],
    regularizationRate: [''],
    noise: [''],
    batchSize: [''],
    regularization: [''],
    dropout: [''],
    momentum: [''],
    preventLoss: [''],
    testToTrain: [''],
    optimizer: [''],
    numEpochs: ['']
  })

  public submitErrorMessage = ""

  constructor(private translate : TranslateService ,private playground: PlaygroundService, private modalService: NgbModal, private fb: FormBuilder, private toastr:ToastrService) { }

  ngOnInit(): void {
        

        if(!sessionStorage.getItem("numLayers"))
        {
          this.addLayer();
        }

        if(!this.model.NotRefresh)
        {
          if(sessionStorage.getItem('problemType'))
          {
            this.model.ProblemType=sessionStorage.getItem('problemType');
          }
          if(sessionStorage.getItem('Regularization'))
          {
            this.model.Regularization=sessionStorage.getItem('Regularization');
          }
          if(sessionStorage.getItem('LearningRate'))
          {
            this.model.LearningRate=sessionStorage.getItem('LearningRate');
          }
          if(sessionStorage.getItem('RegularizationRate'))
          {
            this.model.RegularizationRate=sessionStorage.getItem('RegularizationRate');
          }
          if(sessionStorage.getItem('Dropout'))
          {
            this.model.Dropout=sessionStorage.getItem('Dropout');
          }
          if(sessionStorage.getItem('Momentum'))
          {
            this.model.Momentum=sessionStorage.getItem('Momentum');
          }
          if(sessionStorage.getItem('PreventLoss'))
          {
            this.model.PreventLoss=sessionStorage.getItem('PreventLoss');
          }
          if(sessionStorage.getItem('nodeLayersArray'))
          {
            this.model.nodeLayersArray=JSON.parse(sessionStorage.getItem('nodeLayersArray')!);
          }
          if(sessionStorage.getItem('layersActivationFunctions'))
          {
            this.model.layersActivationFunctions=JSON.parse(sessionStorage.getItem('layersActivationFunctions')!)
          }
          if(sessionStorage.getItem('numLayers'))
          {
            this.model.numLayers=Number(sessionStorage.getItem('numLayers'));
          }
          if(sessionStorage.getItem('TestToTrainRatio'))
          {
            this.model.TestToTrainRatio=sessionStorage.getItem('TestToTrainRatio')
          }
          if(sessionStorage.getItem('Optimizer'))
          {
            this.model.Optimizer=sessionStorage.getItem('Optimizer');
          }
          if(sessionStorage.getItem('NumEpochs'))
          {
            this.model.NumEpochs=sessionStorage.getItem('NumEpochs');
          }
          if(sessionStorage.getItem('Noise'))
          {
            this.model.Noise=sessionStorage.getItem('Noise');
          }
          if(sessionStorage.getItem('BatchSize'))
          {
            this.model.BatchSize=sessionStorage.getItem('BatchSize');
            this.model.BatchIndex = this.batchSizePowerArray.indexOf(Number(this.model.BatchSize));
          }
          this.model.NotRefresh=true;

          this.disableRegInputsFunc();
          this.disableMomentumInputsFunc();
        }
      
        this.disableRegInputsFunc();
        this.disableMomentumInputsFunc();
  }



  OptimizerChange(event: any)
  {
    this.model.Optimizer=event.target.value
    sessionStorage.setItem('Optimizer',this.model.Optimizer);
    this.disableMomentumInputsFunc();
  }

  PreventLossChange(event:any)
  {
    this.model.PreventLoss=event.target.value;
    sessionStorage.setItem('PreventLoss',this.model.PreventLoss);
  }
  DropoutChange(event:any)
  {
    //console.log(event.target.value);
    this.model.Dropout=event.target.value;
    sessionStorage.setItem('Dropout',this.model.Dropout);
  }
  TTRChanged(e: any) {
    this.model.TestToTrainRatio = e.target.value;
    sessionStorage.setItem('TestToTrainRatio',this.model.TestToTrainRatio);
  }

  NoiseChanged(e: any) {
    this.model.Noise = e.target.value;
    sessionStorage.setItem('Noise',this.model.Noise);
  }

  BatchSizeChanged(e: any) {
    this.model.BatchSize = this.batchSizePowerArray[e.target.value];
    this.model.BatchIndex = this.getBatchIndex(this.model.BatchSize);
    //console.log(this.model.BatchSize)
    sessionStorage.setItem('BatchSize',this.model.BatchSize);
    sessionStorage.setItem('BatchIndex',this.model.BatchIndex);
  }

  getBatchIndex(val:any):number
  {
    return this.batchSizePowerArray.indexOf(val);
  }

  checkNumberOfNodes():boolean
  {
    for (let index = 0; index < this.nodeLayersArray.length; index++) {
      const element = this.model.nodeLayersArray[index];
      
      if(element > 256)
      {
        return false;
      }
    }
    
    return true;
  }

  checkNumberOfNodesLessThanZero():boolean
  {
    for (let index = 0; index < this.nodeLayersArray.length; index++) {
      const element = this.model.nodeLayersArray[index];
      
      if(element <= 0)
      {
        return false;
      }
    }
    
    return true;
  }

  addLayer() {
    
    if (this.model.numLayers >= 18) {
      return;
    }
    //console.log(this.model.numLayers);
    this.model.nodeLayersArray.push(2)
    this.model.layersActivationFunctions.push('relu');
    this.model.numLayers += 1;
    sessionStorage.setItem('nodeLayersArray',JSON.stringify(this.model.nodeLayersArray));
    sessionStorage.setItem('layersActivationFunctions',JSON.stringify(this.model.layersActivationFunctions));
    sessionStorage.setItem('numLayers',this.model.numLayers.toString());
    
  }

  removeLayer() {
    
    if (this.model.numLayers <= 1) {
      return;
    }
    //console.log(this.model.numLayers);
    this.model.nodeLayersArray.pop();
    this.model.layersActivationFunctions.pop();
    this.model.numLayers -= 1;
    sessionStorage.setItem('nodeLayersArray',JSON.stringify(this.model.nodeLayersArray));
    sessionStorage.setItem('layersActivationFunctions',JSON.stringify(this.model.layersActivationFunctions));
    sessionStorage.setItem('numLayers',this.model.numLayers.toString());
  }

  updateLayerValue(event: any) {
    event.preventDefault();

    this.model.nodeLayersArray[event.target.id] = parseInt(event.target.value);
    sessionStorage.setItem('nodeLayersArray',JSON.stringify(this.model.nodeLayersArray));
   
  }

  trackByFn(index: any, item: any) {
    return index;
  }
  

  addToEncode(cat: any): void {

    for (let i = 0; i < this.toEncode.length; i++) {
      if (this.toEncode[i].name === cat) {
        this.toEncode = this.toEncode.filter(c => c.name != cat);
        return;
      }
    }

    this.toEncode.push(new VariableEncode(cat, 'label'));
  }



  selectActivationFunctionForLayer(e: any, i: any) {
    this.model.layersActivationFunctions[i] = e.target.value;
    sessionStorage.setItem('layersActivationFunctions',JSON.stringify(this.model.layersActivationFunctions));
  }




  disableRegInputsFunc()
  {
    if(this.model.Regularization == "none")
    {
      this.disableRegInput = true;
      this.model.RegularizationRate = 0;
    }
    else
    {
      this.disableRegInput = false;
    }
  }

  RegularizationChange(event:any)
  {
    this.model.Regularization=event.target.value
    sessionStorage.setItem('Regularization',this.model.Regularization);
    this.disableRegInputsFunc();
  }



  disableMomentumInputsFunc()
  {
    if(this.model.Optimizer == "sgd" || this.model.Optimizer == "rmsprop")
    {
      this.disableMomentumInput = false;
      this.model.Momentum = 0.9;
    }
    else
    {
      this.disableMomentumInput = true;
      this.model.Momentum = 0;
    }
  }


  checkMomentum(popover:any,event:any)
  {
    let value = event.target.value;

    //console.log(value);

    if(value >= 0 && value <= 1)
    {
      if (popover.isOpen()) {
        popover.close();
        event.target.value = 0.9
      }
      
    }
    else
    {
        popover.open();
        event.target.value = 0.9
    }
    this.model.Momentum=event.target.value;
    sessionStorage.setItem('Momentum',this.model.Momentum);
  }

  checkLearning(popover:any,event:any)
  {
    let value = event.target.value;

    //console.log(value);

    if(value >= 0 && value < 10)
    {
      if (popover.isOpen()) {
        popover.close();
        event.target.value = 0.0001
      }
      
    }
    else
    {
        popover.open();
        event.target.value = 0.0001
        this.model.LearningRate= 0.0001;
        sessionStorage.setItem('LearningRate',this.model.LearningRate);
        return;
    }
    this.model.LearningRate=value;
    sessionStorage.setItem('LearningRate',this.model.LearningRate);
  }

  checkRegRate(popover:any,event:any)
  {
    //let valueInitial = event.target.value;

    let value = event.target.value
    //console.log(Number(value))

    if(Number(value)>=0 && Number(value) <= 10)
    {
      if (popover.isOpen()) {
        popover.close();
        event.target.value = 0
      }
    }
    else
    { 
        event.target.value = 0
        popover.open();
        this.model.RegularizationRate = 0;
        sessionStorage.setItem('RegularizationRate',this.model.RegularizationRate);
        return;
        
    }
    this.model.RegularizationRate = event.target.value;
    sessionStorage.setItem('RegularizationRate',this.model.RegularizationRate);
  }

  checkEpochs(popover:any,event:any)
  {
    let value = event.target.value;
    //console.log(Number(value));

    if(Number(value) == 0)
    {
      return;
    }

    if((Number(value) >= 1 && Number(value) <= 1000))
    {
      if (popover.isOpen()) {
        popover.close();
        event.target.value = 100
      }
      
    }
    else
    { 
        event.target.value = 100
        popover.open();
        this.model.NumEpochs=100;
        sessionStorage.setItem('NumEpochs',this.model.NumEpochs);
        return;
    }
    this.model.NumEpochs=event.target.value;
    sessionStorage.setItem('NumEpochs',this.model.NumEpochs);
  }

  WebService() {


    if (Number(this.model.NumEpochs) == 0) {
      this.submitErrorMessage = this.translate.instant("toster.p9")
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      //alert("Training in progress!");
      return;
    }

    if (this.ann.getInProgress() == true) {
      this.submitErrorMessage = this.translate.instant("toster.p10");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      //alert("Training in progress!");
      return;
    }

    if (this.table.inputs.length === 0) {
      //alert("Inputs are not selected!");
      this.submitErrorMessage = this.translate.instant("toster.p11");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }

    if (this.table.inputs.includes(this.output) === true) {
      // alert(this.output + " can't be input and output!");
      this.submitErrorMessage = this.output + this.translate.instant("toster.p12");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }

    if(this.checkNumberOfNodesLessThanZero() == false)
    {
      this.submitErrorMessage = this.translate.instant("toster.p13");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
     // alert("Too much nodes in a layer, maximum is 256");
      return;
    }


    if(this.checkNumberOfNodes() == false)
    {
      this.submitErrorMessage = this.translate.instant("toster.p14");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
     // alert("Too much nodes in a layer, maximum is 256");
      return;
    }
    
    if(this.model.LearningRate === "")
    {
      this.submitErrorMessage = this.translate.instant("toster.p15");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }

    if(this.model.RegularizationRate === "" && (this.model.Regularization == "L1" || this.model.Regularization == "L2"))
    {
      this.submitErrorMessage = this.translate.instant("toster.p16");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }

    if(this.model.Momentum === "")
    {
      this.submitErrorMessage = this.translate.instant("toster.p17");
      this.toastr.error(this.submitErrorMessage,this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
      return;
    }
    

    this.submitErrorMessage = ""

    //console.log(parseFloat(this.neuralNetworkModel.value.momentum))

    this.globalClass.setTrainingStarted(true);

    let layers = [];
    
    this.layers = [];

    let nodesPerLayer:any[] = JSON.parse(sessionStorage.getItem("nodeLayersArray")!);
    let layerFunctions:any[] = JSON.parse(sessionStorage.getItem("layersActivationFunctions")!);
    let numLayers = sessionStorage.getItem("numLayers");

    // for (let i = 0; i < this.nodeLayersArray.length; i++) {
    //   this.layers.push(new Layer(this.model.nodeLayersArray[i], this.model.layersActivationFunctions[i]))
    //   // this.model.layers.push(new Layer(this.model.nodeLayersArray[i], this.model.layersActivationFunctions[i]));
    // }

    for (let i = 0; i < Number(numLayers); i++) {
      this.layers.push(new Layer(nodesPerLayer[i], layerFunctions[i]))
      // this.model.layers.push(new Layer(this.model.nodeLayersArray[i], this.model.layersActivationFunctions[i]));
    }

    const allEncodings = JSON.parse(sessionStorage.getItem('encodings')!);
    let newEncodings: any[] = [];
    this.table.inputs.forEach((col:any) => {
      allEncodings!.forEach((element: any) => {
        if (col == element.columnName && element.encodingMethod != 'none') {
          newEncodings.push(element);
        }
      });
    });

    //console.log(newEncodings);

    //console.log(this.model.Optimizer)
    let temppath = JSON.parse(sessionStorage.getItem('path')!);
    this.table.setPath(temppath);
    let ann = {
      LearningRate: Number(this.neuralNetworkModel.value.learningRate),
      RegularizationRate: Number(this.neuralNetworkModel.value.regularizationRate),
      NumberOfLayers: this.model.numLayers,
      Layers: this.layers,
      Noise: this.neuralNetworkModel.value.noise,
      BatchSize: this.batchSizePowerArray[this.neuralNetworkModel.value.batchSize],
      Regularization: this.neuralNetworkModel.value.regularization,
      TestToTrain: parseInt(this.model.TestToTrainRatio),
      Dropout: parseFloat(this.neuralNetworkModel.value.dropout),
      Momentum: parseFloat(this.neuralNetworkModel.value.momentum),
      PreventLossIncreases: Boolean(this.neuralNetworkModel.value.preventLoss),
      EncodingMethod: this.encodingMethod,
      Epoch: this.model.NumEpochs,
      Optimizer: this.model.Optimizer,
      Inputs: this.table.inputs,
      Output: this.table.output,
      Path: this.table.getPath(),
      Encodings: newEncodings,
      ProblemType: this.model.ProblemType
    };
    //console.log(ann);
    // console.log(this.table.getPath())
  
    
    this.ann.setInProgress(true);

    // this.playground.getNeuroModel(ann).subscribe((response: any) => {

    //   this.ann.setLoss(response.loss);
    //   this.ann.setValLoss(response.valLoss);
    //   this.ann.setMSE(response.meanSqauredError);
    //   this.ann.setVMSE(response.valMeanSqauerdError);

    //   this.data1 = this.ann.getCharData1();
    //   this.data2 = this.ann.getCharData2();
    //   this.emitData1.emit(this.data1);
    //   this.emitData2.emit(this.data2);
    //   this.ann.setInProgress(false);
    //   this.globalClass.setTrainingStarted(false);

    // }, error => {
    //   this.globalClass.setTrainingStarted(false);
    //   alert(error.error.text);
    // });
    
    this.playground.livetrain(ann).subscribe(x=>{

    });
    
    
  }


  setProblemType(event: any) {
    this.problemType = event.target.value;
    this.problemType = this.problemType.toLowerCase();
    this.model.ProblemType = this.problemType;
    sessionStorage.setItem('problemType', this.problemType);
  }

}

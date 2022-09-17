import { Layer } from "./Layer";

export class Model {
    public static ProblemType:any = "regression";
    public static TestToTrainRatio: any = 80;
    public static Noise: any = 0;
    public static BatchSize: any = 32;
    public static BatchIndex: any = 3;
    public static RegularizationRate: any = 0;
    public static ActivationFunction: any = "relu";
    public static LearningRate: any = 0.01;
    public static Dropout: any = 0;
    public static Momentum: any = 0.9;
    public static PreventLoss: any = true;
    public static Optimizer:any = "adam";
    public static NumEpochs:any = 100;
    public static numLayers: number = 1;
    public static nodeLayersArray: Array < number > = [2];
    public static toEncode: any[] = [];
    public static layers: Layer[] = [];
    public static layersActivationFunctions: string[] = ['relu'];
    public static Regularization:any="none";
    public static NotRefresh:boolean=false;

    public static ResetModel(){
        this.ProblemType = "regression"
        this.TestToTrainRatio = 80;
        this.Noise= 0;
        this.BatchSize= 32;
        this.BatchIndex = 3;
        this.RegularizationRate = 0;
        this.ActivationFunction= "relu";
        this.LearningRate= 0.01;
        this.Dropout= 0;
        this.Momentum= 0;
        this.PreventLoss = true;
        this.Optimizer = "adam";
        this.NumEpochs = 100;
        this.numLayers = 1;
        this.nodeLayersArray= [2];
        this.toEncode= [];
        this.layers = [];
        this.layersActivationFunctions = ['relu'];
        this.Regularization="none";
        this.NotRefresh=false;
    }
    public static SetModelDefault(){
        sessionStorage.setItem("problemType",this.ProblemType);
        sessionStorage.setItem('TestToTrainRatio',this.TestToTrainRatio);
        sessionStorage.setItem('Noise',this.Noise);
        sessionStorage.setItem('BatchSize',this.BatchSize);
        sessionStorage.setItem('BatchIndex',this.BatchIndex);
        sessionStorage.setItem('RegularizationRate',this.RegularizationRate);
        sessionStorage.setItem('ActivationFunction',this.ActivationFunction);
        sessionStorage.setItem('LearningRate',this.LearningRate);
        sessionStorage.setItem('Dropout',this.Dropout);
        sessionStorage.setItem('Momentum',this.Momentum);
        sessionStorage.setItem('PreventLoss',this.PreventLoss);
        sessionStorage.setItem('Optimizer',this.Optimizer);
        sessionStorage.setItem('NumEpochs',this.NumEpochs);
        sessionStorage.setItem('nodeLayersArray',JSON.stringify(this.nodeLayersArray));
        sessionStorage.setItem('layersActivationFunctions',JSON.stringify(this.layersActivationFunctions));
        sessionStorage.setItem('numLayers',this.numLayers.toString());
        sessionStorage.setItem('Regularization',this.Regularization);
        

    }
}
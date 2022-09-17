import { ChartOptions, ChartData } from 'chart.js';

export class ANNTraining {

  private static inProgress: boolean = false;
  private static loss: any = [];
  private static lineLoss: any = { label: 'Training Loss', data: this.loss };
  private static valLoss: any = [];
  private static lineValLoss: any = { label: 'Validation Loss', data: this.valLoss };  
  private static mse: any = [];
  private static lineMSE: any = { label: 'Training MSE', data: this.mse };
  private static vmse: any = [];
  private static lineVMSE: any = { label: 'Validation MSE', data: this.vmse };

  public static chartData1: ChartData<'bar'> = {
    labels: [],
    datasets: [
      this.lineLoss, this.lineValLoss,
    ],

  };

  public static chartData2: ChartData<'bar'> = {
    labels: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
    datasets: [
      this.lineMSE, this.lineVMSE,
    ]
  };

  public static getCharData1(): ChartData<'bar'> {
      return this.chartData1;
  }

  public static getCharData2(): ChartData<'bar'> {
    return this.chartData2;
}

  public static setLoss(loss: any): void {
      this.lineLoss.data = loss;
  }

  public static setValLoss(valLoss: any): void {
      this.lineValLoss.data = valLoss;
  }

  public static setMSE(mse: any): void {
      this.lineMSE.data = mse;
  }

  public static setMSELabel(label:any):void{
      this.lineMSE.label = label;
  }

  public static setVMSE(vmse: any): void {
      this.lineVMSE.data = vmse;
  }

  public static setVMSELabel(label:any){
      this.lineVMSE.label = label;
  }

  public static getInProgress(): boolean {
      return this.inProgress;
  }

  public static setInProgress(inProgress: boolean): void {
      this.inProgress = inProgress;
  }

  public static hasData(): boolean {
      if (this.lineLoss.data.length > 0)
        return true;
        return false;
  }

}

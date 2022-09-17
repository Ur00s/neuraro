import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ANNTraining } from 'src/app/_models/ANNTraining';
import { BaseChartDirective } from 'ng2-charts';
import { TrainHubService } from 'src/app/_services/train-hub.service';

@Component({
  selector: 'app-graphic',
  templateUrl: './graphic.component.html',
  styleUrls: ['./graphic.component.scss']
})
export class GraphicComponent implements OnInit {
  @ViewChildren(BaseChartDirective) chart?:QueryList<BaseChartDirective>;
  
  public ann = ANNTraining
  constructor(private chartHub: TrainHubService) { }

  ngOnInit(): void {


    this.newChartOptionsMSE.plugins.title.text = this.getTitle();
    this.newChartOptionsMSE.scales.y.title.text = this.getYLabel()

    this.chartHub.UpdateChart.asObservable().subscribe(x=>{

      let counter = 0;

      if(counter == 0)
      {
        this.newChartOptionsMSE.plugins.title.text = this.getTitle();
        this.newChartOptionsMSE.scales.y.title.text = this.getYLabel()
        counter = 1;
      }

      this.chart?.forEach(x=>{
        x.update();
      })
    })
  }

  getYLabel(): string {
    const problemType = sessionStorage.getItem('problemType');
    if (problemType) {
      if (problemType == 'regression')
        return "Mean Squarred Error";
      else
        return "Accuracy";
    } else {
      return "Mean Squarred Error";
    }
  }

  getTitle(): string {
    const problemType = sessionStorage.getItem('problemType');
    if (problemType) {
      if (problemType == 'regression')
        return "Mean Squarred Error per Epoch";
      else
        return "Accuracy per Epoch";
    } else {
      return "Mean Squarred Error per Epoch";
    }
  }

  public newChartOptionsLoss = {
    responsive: true,
    animation: {
      duration: 5000,
      interaction: {
        intersect: false
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Loss per Epoch',
        color: "rgb(65, 153, 235)"
      },
    },
    pointRadius: 0,
    pointHitRadius: 80,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Loss',
          color: "rgb(65, 153, 235)"
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epochs',
          color: "rgb(65, 153, 235)"
        },
      }
    }
  }

  public newChartOptionsMSE = {
    responsive: true,
    animation: {
      duration: 5000,
      interaction: {
        intersect: false
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Mean Squarred Error per Epoch',
        color: "rgb(65, 153, 235)"
      },
    },
    pointRadius: 0,
    pointHitRadius: 80,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Mean Squarred Error',
          color: "rgb(65, 153, 235)"
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epochs',
          color: "rgb(65, 153, 235)"
        }
      }
    }
  }

  // chartOptions: ChartOptions = {
  //   responsive: true,
  //   plugins: {
  //     title: {
  //       display: true,
  //       text: 'Loss per Epoch',
  //     },
  //   },
  // };
  // chartOptions1: ChartOptions = {
  //   responsive: true,
  //   plugins: {
  //     title: {
  //       display: true,
  //       text: 'Mean Squarred Error',
  //     },
      
  //   },
    
  // };
  data1: ChartData <'bar'> = this.ann.getCharData1();

  data2: ChartData <'bar'> = this.ann.getCharData2();
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Chart, LinearScale, CategoryScale,ChartType } from 'chart.js';
import { BoxPlotController, BoxAndWiskers, Violin, ViolinController } from '@sgratzl/chartjs-chart-boxplot';
import { PlaygroundService } from 'src/app/_services/playground.service';



Chart.register(BoxPlotController, BoxAndWiskers, Violin, ViolinController, LinearScale, CategoryScale);

@Component({
  selector: 'app-boxplot',
  templateUrl: './boxplot.component.html',
  styleUrls: ['./boxplot.component.scss']
})
export class BoxplotComponent implements OnInit {

  @Output() dataChangedEvent = new EventEmitter<boolean>();
  public chartType:ChartType='boxplot';
  public myChart!:any;
  @Input() numericalStats:any;
  public dataDynamic: any[] = [] ;
  public colNameSave:string = '';

  constructor(private playground:PlaygroundService) { 
    
  }


  ngOnInit(): void {
    //console.log(this.numericalStats)
    let obj = {
      fileID: JSON.parse(sessionStorage.getItem("TableID")!),
      columnName: "Rating"
    }
  }



  ngAfterViewInit(): void {
    let ctx = document.querySelector('canvas')!.getContext('2d');
    this.myChart = new Chart(ctx!, {
      type: this.chartType,
      data: {
        labels: ['vs'],
        datasets: [
          {
            label: 'Dataset 1',
            outlierRadius: 5,
            borderColor: 'rgb(25, 29, 250)',
            borderWidth: 2,
            itemRadius: 0,
            outlierBackgroundColor: 'rgb(242, 44, 44)',
            barThickness:185,
            data: this.dataDynamic,
            backgroundColor:[
              'rgb(65, 153, 235,0.9)',
            ],
            

          },
        ],
      },
      options: {
        plugins:{
         

          title:{
            display:true,
            color: "rgb(65, 153, 235)",
            align:'center',
            text:'Outliers',
            font:{
              weight:'bold',
              size:15
            }
          },
          legend:{
            labels:{
              color: 'gray'
            }
          }

        },
        scales:{
          y:{
            grid:{
              color:"gray",
            },
            ticks:{
              color:"gray"
            }
          }
        },
        

        elements: {
          
          boxplot: {
          
          },
        },

      },
    });
    this.fillChartData(this.numericalStats[0].name);
  }

  public changeChartType(event:any)
  {
    this.chartType = event.target.value;
    this.myChart.config.type = this.chartType;
    this.myChart.update();
  }

  updateChart(event:any)
  {
    this.fillChartData(event.target.value)
    
  }

  public fillChartData(colName:string)
  {
    //console.log(this.myChart.data.datasets[0].data)
    for(let i = 0 ; i < this.numericalStats.length ; i++)
    {
      if(this.numericalStats[i].name == colName)
      {
        let colInfo = {
          fileID: JSON.parse(sessionStorage.getItem("TableID")!),
          columnName: colName
        }

        this.playground.getOutliers(colInfo).subscribe((res:any)=>{
          let outliersArray = res.OutliersList;
          let columnStatsObj = this.numericalStats[i];
          
          this.dataDynamic = [{
              min: columnStatsObj.min,
              q1: columnStatsObj.firstQuartile,
              median: columnStatsObj.median,
              mean: columnStatsObj.mean,
              q3: columnStatsObj.thirdQuartile,
              max: columnStatsObj.max,
              outliers: outliersArray,
            }]
          
          
          this.myChart.data.datasets[0].data = this.dataDynamic;
          this.myChart.data.datasets[0].label = colName;
          this.myChart.data.labels = [colName];
          this.colNameSave = colName;

          this.myChart.update()
          
        },
        (error:any) =>{
          console.log(error)
        }
        )

        
        return;
      }
    }
  }


  clearColumnOutliers(event:any)
  {
    let colInfo = {
      fileID: JSON.parse(sessionStorage.getItem("TableID")!),
      columnName: event.target.value
    }

    this.playground.clearOutliers(colInfo).subscribe((res:any)=>{
      //console.log(res);
      this.dataChangedEvent.emit();
      this.fillChartData(colInfo.columnName);
    })

    
  }

}



import { Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { CorrMatrixService } from 'src/app/_services/corr-matrix.service';

@Component({
  selector: 'app-corr-matrix',
  templateUrl: './corr-matrix.component.html',
  styleUrls: ['./corr-matrix.component.scss']
})
export class CorrMatrixComponent implements OnInit {

  kendallOrPearson:boolean = true;

 
  @Input() set kendalPearsonChange(value: boolean) {
    
    this.kendallOrPearson = value;
    this.concatedDataAndCols= this.concatColumnsAndData(this.kendallOrPearson);
  }

  public jsonResult:any;
  public dataColumns:any[] = [];
  public dataPearson:any[] = [];
  public dataKendall:any[] = [];
  public concatedDataAndCols:any[] = [];
  public tableID:number;
  

  constructor(private corrMatrixService:CorrMatrixService) {
    this.tableID = Number(sessionStorage.getItem("TableID"))
  }
   
  ngOnInit(): void {
    this.corrMatrixService.loadCorrMatrix(this.tableID).subscribe((result:any)=>{
      this.dataColumns = result.kendallColumns;
      this.dataPearson = result.pearson;
      this.dataKendall = result.kendall;
      //console.log(this.dataKendall);
      //console.table(this.dataColumns);
      //console.log(this.dataPearson);
      this.concatedDataAndCols= this.concatColumnsAndData(this.kendallOrPearson);
     },
     error => console.log(error)
    );
  }

  public concatColumnsAndData(kendalOrPearson:boolean) {
    var series = [];

    if(kendalOrPearson)
    {
      for (let index = 0; index < this.dataColumns.length; index++) {
        series.push({
          col:this.dataColumns[index],
          data:this.dataPearson[index]
  
        })
        
      }
    }
    else
    {
      for (let index = 0; index < this.dataColumns.length; index++) {
        series.push({
          col:this.dataColumns[index],
          data:this.dataKendall[index]
  
        })
        
      }
    }


    //console.log(series);
    return series;
  }



}

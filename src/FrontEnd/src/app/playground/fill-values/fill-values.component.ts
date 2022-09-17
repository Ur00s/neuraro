import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import { FillMissingService } from 'src/app/_services/fill-missing.service';
import { PlaygroundService } from 'src/app/_services/playground.service';
import { Table } from 'src/app/_models/Table';



@Component({
  selector: 'app-fill-values',
  templateUrl: './fill-values.component.html',
  styleUrls: ['./fill-values.component.scss']
})
export class FillValuesComponent implements OnInit,OnChanges {

  @Output() dataChangedEvent = new EventEmitter<boolean>();
  @Input() updateStats:boolean = false;

  public dataChanged:boolean = false;

  public statsArray: any[] = [];
  public missingValuesArray: any = {
    method: 'none',
    missingValueOption: []
  };



  constructor(private valuesService: FillMissingService, private playgroundService: PlaygroundService) { }

  ngOnChanges(changes: SimpleChanges): void {
    let ssStats = sessionStorage.getItem("stats");
    this.statsArray = JSON.parse(ssStats!);

    this.statsArray.forEach((value, index) => {
      if (value.numberOfNan > 0 && value.numberOfNan != value.count ) {
        if (value.min || value.max || value.mean || value.median) {
          this.missingValuesArray.missingValueOption.push({name : value.name, value: value.mean, id : index});
        } else {
          this.missingValuesArray.missingValueOption.push({name : value.name, value: value.values[0], id : index});
        }
      }
    });
  }

  ngOnInit(): void {
    let ssStats = sessionStorage.getItem("stats");
    this.statsArray = JSON.parse(ssStats!);

    this.statsArray.forEach((value, index) => {
      if (value.numberOfNan > 0 && value.numberOfNan != value.count) {
        if (value.min || value.max || value.mean || value.median) {
          this.missingValuesArray.missingValueOption.push({name : value.name, value: value.mean, id : index});
        } else {
          this.missingValuesArray.missingValueOption.push({name : value.name, value: value.values[0], id : index});
        }
      }
    });

    // console.log(this.statsArray);
    //console.log(this.missingValuesArray);
  }



  setValue(e: any, i: number, col: string) {
    let value = e.target.value;
    let numValue = Number(value);
  
    
    if (Number.isNaN(numValue)) {
      this.missingValuesArray.missingValueOption.forEach((element: any, index: number) => {
        if (element.id === i) {
          // console.log(element);
          this.missingValuesArray.missingValueOption[index].value = value;
        }
      });
    }
    else {
      this.missingValuesArray.missingValueOption.forEach((element: any, index: number) => {
        if (element.id === i) {
          this.missingValuesArray.missingValueOption[index].value = numValue;
        }
      });
    }
    // console.log(this.missingValuesArray);
  }

  fillMissingValues() {
    // console.log(this.missingValuesArray);
    this.valuesService.fillMissingValues(this.missingValuesArray).subscribe((res) => {
      //console.log(res);
      //sessionStorage.removeItem("data");

      let fileId = Number(sessionStorage.getItem("TableID"));
      this.playgroundService.loadTable(fileId).subscribe(res => {
        // console.log(res.)
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

        this.dataChanged = true;
        this.dataChangedEvent.emit(this.dataChanged);
        this.dataChanged = false;

      });
    }, (err) => {
      console.log(err);
    });
  }
  
  haveNullValues(i: number) {
    if (this.statsArray[i].numberOfNan > 0)
      return true;
    return false;
  }

  datasetHaveNullValues() {
    for(let i = 0; i < this.statsArray.length; i++) {
      if (this.statsArray[i].numberOfNan > 0) {
        return true;
      }
    }

    return false;
  }

  selectMethod(e:any) {
    this.missingValuesArray.method = e.target.value;
  }
}

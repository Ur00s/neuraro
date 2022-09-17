import { Component, OnInit } from '@angular/core';
import { FeatureSelectionService } from 'src/app/_services/feature-selection.service';
import { Table } from '../../_models/Table';

@Component({
  selector: 'app-feature-selection',
  templateUrl: './feature-selection.component.html',
  styleUrls: ['./feature-selection.component.scss']
})
export class FeatureSelectionComponent implements OnInit {

  columns = Table.data.columns;
  numberOfInputs: number = 1;
  output = this.columns[0];
  features: any = {};
  public table = Table;

  constructor(private fetureService: FeatureSelectionService) { }

  ngOnInit(): void {
    //console.log("TABLE FROM FEATURE SELECTION")
    //console.log(Table.data);
  }

  featureSelection() {
    if (this.numberOfInputs > this.columns.length - 1) {
      alert("Too many inputs");
    }

    let data = {
      "filePath": "string",
      "output": this.output,
      "numberOfInputs": this.numberOfInputs
    };
    let tableID = Number(sessionStorage.getItem("TableID"));
    this.fetureService.loadFeatureSelection(data, tableID).subscribe(res => this.features = res, err => console.log(err));
  }
  selectFeatures(i:number)
  {
    this.table.inputs=this.features.listOfInputs[i];
    sessionStorage.setItem('inputs',JSON.stringify(this.table.inputs));
    this.table.output=this.output;
    sessionStorage.setItem('output',this.table.output);
    
  }
}

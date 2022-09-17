import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ExperimentService } from '../_services/experiment.service';

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit {
  predictedValue: any = '';
  experimentId?:number;
  experiment?:any;
  predictForm = this.formBuilder.group({});

  constructor(private translate : TranslateService, private formBuilder: FormBuilder,private router: Router, private experimentService: ExperimentService, private route: ActivatedRoute, private toastr:ToastrService) {
    this.experimentId = this.route.snapshot.params['id'];
    this.experimentService.getExperimentById(this.experimentId!).subscribe({
      next: (res: any) => {
        this.experiment = res;
        for (let input of res.inputs) {
          this.predictForm.addControl(input, new FormControl('', [Validators.required]));
        }
      },
      error: (err: any) => {
        this.toastr.error(this.translate.instant("toster.p22"),this.translate.instant("toster.p2"),{
          timeOut:10000,
          closeButton:true,
          positionClass:'toast-top-center'
        })
        this.router.navigate(['/FileAndProjects']);
      }
    });
  }

  ngOnInit(): void {
  }

  getValue(value: any) {
    let numValue = Number(value);
    if (Number.isNaN(numValue)) {
      return value;
    }
    return numValue;
  }

  submit() {
    // console.log(this.predictForm.controls);
    if (this.predictForm.valid) {
      let predicted = [];
      for (let input of this.experiment.inputs) {
        predicted.push({'ColumnName': input, 'Value': this.getValue(this.predictForm.get(input)?.value)});
      }
      const data = {
        "experimentId": this.experimentId,
        "values": predicted
      };

      this.experimentService.makePredictions(data).subscribe({
        next: (res:any) => {
          this.predictedValue = res.Prediction;
          // console.log('res', res);
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    }
    else{
      this.toastr.error(this.translate.instant("toster.p24"),this.translate.instant("toster.p2"),{
        timeOut:10000,
        closeButton:true,
        positionClass:'toast-top-center'
      })
    }
  }

}

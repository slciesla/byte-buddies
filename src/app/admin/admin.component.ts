import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { MdlSnackbarService } from '@angular-mdl/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  item: FirebaseListObservable<any>;

  public form: FormGroup;
  public name = new FormControl();
  public initCost = new FormControl();
  public minPrice = new FormControl();
  public matureTime = new FormControl();
  public deathRate = new FormControl();
  public requiredCPU = new FormControl();
  public collectCost = new FormControl();

  ngOnInit() {
    this.form = this.fb.group({
      'name': this.name,
      'initCost': this.initCost,
      'minPrice': this.minPrice,
      'matureTime': this.matureTime,
      'deathRate': this.deathRate,
      'requiredCPU': this.requiredCPU,
      'collectCost': this.collectCost
    });
  }

  Save() {
    const toSend = this.af.database.list(`/buddies/`);
    toSend.push(this.form.value).key;
    this.snackbarService.showToast('Created ' + this.name.value, 1500);
    this.form.reset();
  }

  constructor(public fb: FormBuilder, public af: AngularFire, private snackbarService: MdlSnackbarService) { }

}

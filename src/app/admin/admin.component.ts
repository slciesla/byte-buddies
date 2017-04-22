import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  item: FirebaseObjectObservable<any>;

  public form: FormGroup;
  public name = new FormControl();
  public initCost = new FormControl();
  public minPrice = new FormControl();
  public matureTime = new FormControl();
  public deathRate = new FormControl();
  public requiredElement = new FormControl();

  ngOnInit() {
    this.form = this.fb.group({
      'name': this.name,
      'initCost': this.initCost,
      'minPrice': this.minPrice,
      'matureTime': this.matureTime,
      'deathRate': this.deathRate,
      'requiredElement': this.requiredElement
    });
  }

  Save() {
    const toSend = this.af.database.object(`/buddies/`);
      toSend.set(this.form.value);
  }

  constructor(public fb: FormBuilder, public af: AngularFire) { }

}

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
  public form2: FormGroup;
  public name = new FormControl();
  public initCost = new FormControl();
  public minPrice = new FormControl();
  public matureTime = new FormControl();
  public deathRate = new FormControl();
  public requiredCPU = new FormControl();
  public collectCost = new FormControl();
  public name2 = new FormControl();
  public ID = new FormControl();
  public description = new FormControl();
  public byteReward = new FormControl();
  public goldReward = new FormControl();
  public image = new FormControl();

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
    this.form2 = this.fb.group({
      'name2': this.name2,
      'ID': this.ID,
      'description': this.description,
      'byteReward': this.byteReward,
      'goldReward': this.goldReward,
      'image': this.image
    });
  }

  Save() {
    const toSend = this.af.database.list(`/buddies/`);
    toSend.push(this.form.value).key;
    this.snackbarService.showToast('Created ' + this.name.value, 1500);
    this.form.reset();
  }

  Save2() {
    const toSend = this.af.database.list(`/achievements/`);
    toSend.push(this.form2.value).key;
    this.snackbarService.showToast('Created ' + this.name2.value, 1500);
    this.form2.reset();
  }

  constructor(public fb: FormBuilder, public af: AngularFire, private snackbarService: MdlSnackbarService) { }

}

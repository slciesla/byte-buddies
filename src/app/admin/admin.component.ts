import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  public form: FormGroup;
  public name = new FormControl();
  public initCost = new FormControl();
  public minPrice = new FormControl();
  public matureTime = new FormControl();
  public deathRate = new FormControl();
  public left = new FormControl();
  public center = new FormControl();
  public right = new FormControl();
  public requiredElement = new FormControl();

  ngOnInit() {
    this.form = this.fb.group({
      'name': this.name,
      'initCost': this.initCost,
      'minPrice': this.minPrice,
      'matureTime': this.matureTime,
      'deathRate': this.deathRate,
      'left': this.left,
      'center': this.center,
      'right': this.right,
      'requiredElement': this.requiredElement
    });
  }

  Save() {
    console.log('poop');
  }

  constructor(public fb: FormBuilder) { }

}

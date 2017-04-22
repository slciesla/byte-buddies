import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Buddy } from '../models/buddy';

@Injectable()
export class BuddyService {

  constructor(private af: AngularFire) { }

  getAll(): FirebaseListObservable<Buddy[]> {
    return this.af.database.list('/buddies/');
  }

}

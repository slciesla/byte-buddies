import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
// import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { LayoutModule } from '@progress/kendo-angular-layout';
import {
  MdlDialogOutletModule,
  MdlDialogOutletService,
  MdlSnackbaModule,
  MdlSnackbarComponent,
  MdlSnackbarService
} from '@angular-mdl/core';
import { AngularFireModule } from 'angularfire2';
import { GrowlModule } from 'primeng/primeng';

import { AppComponent } from './app.component';
import { AdminComponent } from './admin/admin.component';
import { GameComponent } from './game/game.component';
import { BuddyService } from './services/buddy.service';

const routes: Routes = [
  { path: '', component: GameComponent },
  { path: 'admin', component: AdminComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);

// Must export the config
export const firebaseConfig = {
  apiKey: 'AIzaSyDrZ3z0I2O_J5kj8hIdbUK7Mg5J88LgNKA',
  authDomain: 'byte-buddies.firebaseapp.com',
  databaseURL: 'https://byte-buddies.firebaseio.com',
  projectId: 'byte-buddies',
  storageBucket: 'byte-buddies.appspot.com',
  messagingSenderId: '6117024891'
};

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    routing,
    ButtonsModule,
    ReactiveFormsModule,
    DropDownsModule,
    // DropDownListModule,
    LayoutModule,
    MdlDialogOutletModule,
    MdlSnackbaModule,
    GrowlModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  entryComponents: [
    MdlSnackbarComponent
  ],
  providers: [
    MdlDialogOutletService,
    MdlSnackbarService,
    BuddyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

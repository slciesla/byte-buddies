import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { AngularFireModule } from 'angularfire2';


import { AppComponent } from './app.component';
import { AdminComponent } from './admin/admin.component';
import { GameComponent } from './game/game.component';

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
    LayoutModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

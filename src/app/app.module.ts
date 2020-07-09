import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NativeAudio } from '@ionic-native/native-audio/ngx';


let config:SocketIoConfig={
  // url: "https://bullshit-game96.herokuapp.com",
  url: "http://localhost:8000",
  options:{}
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({mode:'ios'}),
    AppRoutingModule,
    CommonModule,
    SocketIoModule.forRoot(config),
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ScreenOrientation,
    NativeAudio
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

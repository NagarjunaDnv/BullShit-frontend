import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AudioService } from './services/audio.service';

const {App}=Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent{
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router,
    private screenOrientation: ScreenOrientation,
    private audioService: AudioService
  ) {
    this.initializeApp();
    this.platform.backButton.subscribeWithPriority(1, async() => {
      if (this.router.url==='' || this.router.url==='home') {
        App.exitApp();
      }
      else if(this.router.url==='game'){
        return;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(this.platform.is('ios')){
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString('#B3000000');
        this.statusBar.styleLightContent();
        this.statusBar.show();
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }
      if(this.platform.is('android')){
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString('#B3000000');
        this.statusBar.show();
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }
      this.splashScreen.hide();
      this.authService.onAuthStateChanged();
      this.authService.signInAnonymously();
      this.preloadAudios();
    });
  }

  preloadAudios(){
    this.audioService.onAudioEnd();
    this.audioService.preload('card-click','../../assets/click-sound.mp3');
    this.audioService.preload('card-flip','../../assets/card-flip.mp3');
    this.audioService.preload('card-declare','../../assets/card-declare.mp3');
    this.audioService.preload('bullshit','../../assets/bullshit.mp3');
    this.audioService.preload('yayy','../../assets/yayy.mp3');
    this.audioService.preload('oops','../../assets/oops.mp3');
  }
}

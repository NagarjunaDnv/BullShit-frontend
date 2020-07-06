import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth.service';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
const {App}=Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (this.router.url==='' || this.router.url==='home') {
        App.exitApp();
      }
      else if(this.router.url==='game'){

      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.authService.onAuthStateChanged();
      this.authService.signInAnonymously();
    });
  }
}

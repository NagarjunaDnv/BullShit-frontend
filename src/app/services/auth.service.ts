import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Socket } from 'ngx-socket-io';
import { GameService } from './game.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { CreateJoinRoomComponent } from '../modals/create-join-room/create-join-room.component';
import { CustomService } from './custom.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private af: AngularFireAuth,
    private socket: Socket,
    private gameService: GameService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private customService: CustomService,
    private router: Router
  ) { }


  signInAnonymously():Promise<firebase.auth.UserCredential>{
    return this.af.signInAnonymously();
  }

  async onAuthStateChanged(){
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
    });
    await loading.present();
    this.af.onAuthStateChanged(user=>{
      if(user){
        console.log('user is',user);
        this.customService.currentUser=user;
        if(!user.displayName){
          this.presentModal(2,'Set Name',true);
          loading.dismiss();
        }
        else{
          this.gameService.setListeners();
          this.socket.connect();
          this.socket.emit('init',{
            uid: this.customService.currentUser.uid
          },(res)=>{
            if(res.inGame){
              this.gameService.listenForPlayers();
              this.gameService.listenForInitialCards();
              this.gameService.listenForCurrentPlayerTurn();
              this.gameService.listenForcurrentStackDetailCount();
              this.gameService.listenForRevealedCards();
              this.gameService.listenForDeclarations();
              this.gameService.listenForBullShitClicks();
              this.gameService.listenForLiarToasts();
              this.gameService.listenForWin();
              this.gameService.playerIndex=res['playerIndex'];
              this.gameService.formCoordinates();
              loading.dismiss();
              this.router.navigateByUrl('/game');
            }
            else{
              loading.dismiss();
              this.router.navigateByUrl('/home');
            }
          })
        }
       
      }
      else{
        console.log('user logged out');
      }
    })
  }
  async presentModal(type,title,bool=false) {
    const modal = await this.modalController.create({
      component: CreateJoinRoomComponent,
      componentProps:{
        headerText: title,
        type:type,
      },
      backdropDismiss:!bool
    });
    return await modal.present();
  }
}

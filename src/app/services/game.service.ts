import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { CustomService } from './custom.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameDetails:any;
  playerIndex:any;
  coordinates:any=[];
  cards:any;
  //Current Player turn UID
  currentTurnId:any;
  currentStackCount:any;
  currentValue:any;
  currentDeclaration:any;
  revealedCards:any;
  currentLiarProposal:any;
  winnerText:any;
  constructor(
    private socket: Socket,
    private customService: CustomService,
    private router:Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  listenForPlayers(){
    this.socket.on('players',res=>{
      this.gameDetails=res;
      console.log(this.gameDetails);
    })
  }

  formCoordinates(){
    for(let i=0;i<4;i++){
      this.coordinates.push(this.playerIndex-i >-1 ? this.playerIndex-i : this.playerIndex-i+4);
    }
    console.log(this.coordinates);
  }

  listenForInitialCards(){
    console.log('called');
    this.socket.on('initialCards',res=>{
      this.cards=res;
      this.cards.sort((a,b)=>a.numEq-b.numEq);
    })
  }
  listenForCurrentPlayerTurn(){
    this.socket.on('turn',res=>{
      console.log(res);
      this.currentTurnId= res['uid'];
      this.currentValue= res['value'];
    })
  }
  listenForcurrentStackDetailCount(){
    this.socket.on('currentStackDetailCount',res=>{
      console.log(res);
      this.currentStackCount=res;
    })
  }
  listenForDeclarations(){
    this.socket.on('declarations',res=>{
      console.log(res);
      this.currentDeclaration=res;
    })
  }
  listenForBullShitClicks(){
    this.socket.on('bullshitClicks',res=>{
      this.currentLiarProposal=res;
    })
  }
  async setListeners(){
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Reconnecting...',
    });
    this.socket.on("disconnect", async()=> {
      console.log("Disconnected");
      await loading.present();
    });
    
    this.socket.on("reconnect", function() {
      console.log("Reconnecting");
    });
    
    this.socket.on("connect", ()=> {
      // this.socket.removeAllListeners();
      this.socket.emit("init", {
        uid: this.customService.currentUser.uid
      },(res)=>{
        if(res.inGame){
          this.listenForPlayers();
          this.listenForInitialCards();
          this.listenForCurrentPlayerTurn();
          this.listenForcurrentStackDetailCount();
          this.listenForDeclarations();
          this.listenForBullShitClicks();
          this.listenForLiarToasts();
          this.listenForRevealedCards();
          this.listenForWin();
          this.listenForcurrentStackDetailCount();
          this.playerIndex=res['playerIndex'];
          this.formCoordinates();
          this.router.navigateByUrl('/game');
          loading.dismiss();
        }
        else{
          this.removeAllListeners();
          loading.dismiss();
          this.router.navigateByUrl('/home');
        }
      });
    });
  }
  listenForRevealedCards(){
    this.socket.on('revealDeclaredCards',res=>{
      this.revealedCards=res;
    })
  }
  removeAllListeners(){
    this.socket.removeAllListeners();
    this.gameDetails=null;
    this.playerIndex=null;
    this.coordinates=[];
    this.cards=null;
  //Current Player turn UID
    this.currentTurnId= null;
    this.currentStackCount=null;
    this.currentValue=null;
    this.currentDeclaration=null;
    this.revealedCards=null;
    this.currentLiarProposal=null;
    this.winnerText=null;
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  listenForLiarToasts(){
    this.socket.on('liarToasts',res=>{
    console.log(res)
     this.presentToast(res['text']);
    })
  }
  listenForWin(){
    this.socket.on('win',res=>{
      this.winnerText=res['text'];
      setTimeout(()=>{
        this.removeAllListeners();
        this.router.navigateByUrl('/home');
      },5000);
    })
  }
}


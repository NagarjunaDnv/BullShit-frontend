import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { CustomService } from 'src/app/services/custom.service';

@Component({
  selector: 'app-create-join-room',
  templateUrl: './create-join-room.component.html',
  styleUrls: ['./create-join-room.component.scss'],
})
export class CreateJoinRoomComponent implements OnInit {

  @Input() type:number;
  @Input() headerText:string;
  roomId:any;
  name:any;  
  constructor(
    private modalController: ModalController,
    private socket:Socket,
    private router:Router,
    private gameService: GameService,
    private customService: CustomService
  ) { }

  ngOnInit() {
    console.log(this.type,this.headerText);
  }

  createRoom(){
    if(this.validateRoomId()){
      const reqObj={
        name: this.customService.currentUser.displayName ? this.customService.currentUser.displayName : 'Nibba',
        roomId: this.roomId,
        uid: this.customService.currentUser.uid
      }
      this.socket.emit('createRoom',reqObj,this.navigateToGamePage.bind(this));
    }
  }

  joinRoom(){
    if(this.validateRoomId()){
      const reqObj={
        name: this.customService.currentUser.displayName ? this.customService.currentUser.displayName : 'Nibba',
        roomId: this.roomId,
        uid: this.customService.currentUser.uid
      }
      this.socket.emit('waitingRoom',reqObj,this.navigateToGamePage.bind(this));
    }
  }

  validateRoomId():boolean{
    if(!this.roomId || this.roomId===''){
      return false;
    }
    else{
      return true;
    }
  }

  async navigateToGamePage(res){
    if(res.success){
      this.gameService.playerIndex=res['playerIndex'];
      this.gameService.formCoordinates();
      console.log(res);
      this.gameService.listenForPlayers();
      this.gameService.listenForInitialCards();
      this.gameService.listenForCurrentPlayerTurn();
      this.gameService.listenForcurrentStackDetailCount();
      this.gameService.listenForDeclarations();
      this.gameService.listenForRevealedCards();
      this.gameService.listenForBullShitClicks();
      this.gameService.listenForLiarToasts();
      this.gameService.listenForWin();
      await this.modalController.dismiss();
      this.router.navigateByUrl('/game');
    }
    else{
      alert(res.message);
    }
  }
  async setDisplayName(){
    if(!this.name || this.name==''){
      return;
    }
    else{
      await this.customService.currentUser.updateProfile({
        displayName: this.name.split(' ')[0]
      }).then(res=>{
        this.modalController.dismiss();
      }).catch(err=>{
        alert("Please try again later");
      })
    }
  }
  goBack(){
    this.modalController.dismiss();
  }
}

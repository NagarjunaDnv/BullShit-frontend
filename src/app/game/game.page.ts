import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { CustomService } from '../services/custom.service';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {

  stack: Array<any>=[];
  indices: Array<number>=[];
  cardSet:Set<string>=new Set();
  hideButtons:boolean=false;
  isBullshitClicked:boolean=false;
  youText:string='You';
  constructor(
    public gameService: GameService,
    public customService: CustomService,
    private socket: Socket,
    private router: Router
  ) { }

  ngOnInit() {
  }
  
  selectCard(card,indexInCardsArray){
    if(this.gameService.currentTurnId!=this.customService.currentUser.uid){
      return false;
    }
    const index=this.IndexInStack(card);
    if(index==-1){
      if(this.stack.length===4){
        this.cardSet.delete(`${this.stack[0]['value']}${this.stack[0]['suit']}`)
        this.stack.shift();
        this.indices.shift();
      }
      this.cardSet.add(`${card['value']}${card['suit']}`)
      this.stack.push(card);
      this.indices.push(indexInCardsArray)
    }
    else{
      this.cardSet.delete(`${card['value']}${card['suit']}`)
      this.stack.splice(index,1);
      this.indices.splice(index,1);
    }
    console.log(this.cardSet);
    console.log(this.indices);
  }

  IndexInStack(card):number{
    const index=this.stack.findIndex(cardDetails=> {
      return (cardDetails.suit===card.suit && cardDetails.value===card.value)
    })
    return index;
  }

  addCards(){
    this.hideButtons= true;
    const previousIndex= this.gameService.coordinates[1];
    if(this.checkForWinner(previousIndex)){
      this.gameService.winnerText=`${this.gameService.gameDetails['players'][previousIndex]['name']} won!!`
      this.socket.emit('winnerFromClient',{
        text: `${this.gameService.gameDetails['players'][previousIndex]['name']} won!!`,
        uid: `${this.gameService.gameDetails['players'][previousIndex]['uid']}`,
        winnerIndex: previousIndex,
        roomId: this.gameService.gameDetails['id'],
        clientIndex: this.gameService.coordinates[0]
      });
      setTimeout(()=>{
        this.gameService.removeAllListeners();
        this.router.navigateByUrl('/home');
      },5000);
      return;
    }
    const body={
      declaredCardsActual: JSON.parse(JSON.stringify(this.stack)),
      declaredBy: {
        id: this.customService.currentUser.uid,
        name: this.customService.currentUser.displayName
      },
      count: this.stack.length,
      value: this.gameService.currentValue,
      roomId: this.gameService.gameDetails['id'],
      nextUID: this.gameService.gameDetails['players'][ this.gameService.coordinates[3] ]['uid'],
      nextValue: this.findNextValue(this.gameService.currentValue)
    }
    this.gameService.currentStackCount+= JSON.parse(JSON.stringify(this.stack)).length;
    this.gameService.currentDeclaration={
      count: body.count,
      declaredBy: body.declaredBy,
      value: body.value
    }
    this.indices.sort((a,b)=>b-a);
    while(this.stack.length>0){
      const index=this.indices.shift();
      console.log(index);
      this.gameService.cards.splice(index,1);
      this.cardSet.delete(`${this.stack[0]['value']}${this.stack[0]['suit']}`)
      this.stack.shift();
    }
    this.gameService.currentTurnId= body['nextUID'];
    this.gameService.currentValue= body['nextValue'];
    this.hideButtons= false;
    this.socket.emit('declare', body);
    this.socket.emit('userCardDetails',{
      cards: this.gameService.cards,
      uid: this.customService.currentUser.uid
    });
  }

  findNextValue(currentVal){
    if(currentVal==='A'){
      return 2;
    }
    else if(currentVal===10){
      return 'J'
    }
    else if(currentVal==='J'){
      return 'Q'
    }
    else if(currentVal==='Q'){
      return 'K'
    }
    else if(currentVal==='K'){
      return 'A'
    }
    else{
      return parseInt(currentVal)+1;
    }
  }

  bullshit(){
    this.isBullshitClicked=true;
    const body={
      from:{
        id: this.customService.currentUser.uid,
        name: this.customService.currentUser.displayName
      },
      to:{
        id: this.gameService.currentDeclaration['declaredBy']['id'],
        name: this.gameService.currentDeclaration['declaredBy']['name']
      },
      roomId: this.gameService.gameDetails['id'],
      previousValue: this.gameService.currentDeclaration['value'],
      count: this.gameService.currentDeclaration['count'],
      nextUID: this.gameService.gameDetails['players'][ this.gameService.coordinates[3] ]['uid'],
      currentValue: this.gameService.currentValue,
    }
    this.socket.emit('bullshit',body,(res)=>{
      this.isBullshitClicked=false;
      this.gameService.presentToast(res.text);
    });
  }

  checkForWinner(index){
    if(this.gameService.gameDetails['players'][index]['count']===0){
      return true;
    }
    else{
      return false;
    }
  }
}

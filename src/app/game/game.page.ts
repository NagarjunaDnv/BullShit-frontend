import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { CustomService } from '../services/custom.service';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger, animateChild } from '@angular/animations';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  animations: [
    trigger('list', [
      transition(':enter', [
        query('@cards-bottom', stagger(300,animateChild()),{optional:true}),
        query('@cards-top', stagger(300,animateChild()),{optional:true}),
        query('@cards-left', stagger(300,animateChild()),{optional:true}),
        query('@cards-right', stagger(300,animateChild()),{optional:true}),
        query('@cards-declaration', stagger(300,animateChild()),{optional:true})
      ]),
    ]),
    trigger('cards-bottom', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
        style({ transform: "*", opacity: 1, height: '*' }),
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
         style({ 
           transform: "translate(0,-40vh)", opacity: 0, 
           height: '0px'
         }))
      ])
    ]),
    trigger('cards-top',[
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
        style({ transform: "*", opacity: 1,}),
        animate('2s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
         style({ 
           transform: "translate(0,30vh)", opacity: 0
         }))
      ])
    ]),
    trigger('cards-left',[
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
        style({ transform: "*", opacity: 1,}),
        animate('2s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
         style({ 
           transform: "translate(50vw,-6vh) rotate(90deg)", opacity: 0
         }))
      ])
    ]),
    trigger('cards-right',[
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ]),
      transition(':leave', [
        style({ transform: "*",opacity: 1}),
        animate('2s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
         style({ 
           transform: "translate(-50vw,-6vh) rotate(90deg)",
           opacity: 0
         }))
      ])
    ]),
    trigger('cards-declaration',[
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ])
    ]),
    trigger('liar-proposal',[
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ])
    ]),
  ]
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
    private router: Router,
    private audioService: AudioService
  ) { }

  ngOnInit() {

  }
  
  selectCard(card,indexInCardsArray){
    if(this.gameService.currentTurnId!=this.customService.currentUser.uid){
      return false;
    }
    this.audioService.play("card-click");
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
    this.gameService.currentDeclaration= null;
    setTimeout(()=>{
      this.gameService.currentDeclaration={
        count: body.count,
        declaredBy: body.declaredBy,
        value: body.value
      }
      this.audioService.play('card-flip');
      let interval=setInterval(()=>{
        this.audioService.play('card-declare');
      },400);
      setTimeout(()=>{
        clearTimeout(interval)
      },body['count']*400);
    },300);
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
      if(res.isLiar===true){
        this.audioService.play('yayy');
     }
     else{
        this.audioService.play('oops');
     }
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

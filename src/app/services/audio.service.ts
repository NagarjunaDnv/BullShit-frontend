import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
interface Sound {
  key: string;
  asset: string;
  isNative: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private sounds: Sound[] = [];
  private audioPlayer: HTMLAudioElement = new Audio();
  private audioQueue:Sound[]=[];

  constructor(
    private platform: Platform,
    private nativeAudio: NativeAudio
  ) { }

  preload(key: string, asset: string): void {

    if(this.platform.is('cordova')){

      this.nativeAudio.preloadSimple(key, asset);

      this.sounds.push({
        key: key,
        asset: asset,
        isNative: true
      });

    } else {

      let audio = new Audio();
      audio.src = asset;

      this.sounds.push({
        key: key,
        asset: asset,
        isNative: false
      });
    }
  }

  play(key: string): void {

    let soundToPlay = this.sounds.find((sound) => {
      return sound.key === key;
    });

    if(soundToPlay.isNative){
      this.nativeAudio.play(key).then((res) => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    } else {

      if(!this.audioPlayer.src || this.audioPlayer.ended || soundToPlay.asset===this.audioPlayer.src){
        this.audioPlayer.src = soundToPlay.asset;
        this.audioPlayer.play();
      }
      else{
        this.audioQueue.push(soundToPlay);
      }
    }
  }

  onAudioEnd(){
    this.audioPlayer.addEventListener('ended',()=>{
      console.log('ended');
      if(this.audioQueue.length!=0){
        const soundToPlay=this.audioQueue.shift();
        this.audioPlayer.src=soundToPlay.asset;
        this.audioPlayer.play();
      }
    })
  }
}

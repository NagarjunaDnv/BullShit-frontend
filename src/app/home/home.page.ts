import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
    public authService: AuthService,
    private audioService: AudioService
  ) {}
  
  ngOnInit(){
    
  }
}

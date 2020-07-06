import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomService {
  
  currentUser:firebase.User;
  constructor() { }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import {environment} from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor(
    private storageService: StorageService
  ) {
    
  }

  eventConnection(eventId:any){
    // console.log("eventId=====", eventId);
    
    this.socket = io(environment.socketUrl,{
      transports: ['websocket'],
      query:{
        event_id: eventId,
        user_id: this.storageService.getLocalStorageItem('userId')
      },
      auth:{
        token: this.storageService.getLocalStorageItem('authToken')
      }
    });
    console.log("socket======",this.socket);
    // console.log("transports======",this.socket.transports);
    // console.log("query======",this.socket.query);
    console.log("auth======",this.socket.auth);
    
    this.socket.on("connect", () => {
     console.log("connect socket.....");
    });
    this.socket.on('disconnect', () => {
      console.log("Disconnected");
    });
    this.socket.on("connect_error", (error:any) => {
      console.log("error:",error);
  });
  }

  joinRoom(room: string) {
    this.socket.emit('join_room', room);
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data:any) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}

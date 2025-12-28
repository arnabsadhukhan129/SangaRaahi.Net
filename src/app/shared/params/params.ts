import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })  
    

export class paramService {  


    private invitationDetail = new BehaviorSubject({});
    currentInvitationDetail = this.invitationDetail.asObservable();

    /*
    * for layout menu section
    */

    private selectCurrentRoute = new BehaviorSubject('');
    currentRoute = this.selectCurrentRoute.asObservable();
  
    constructor() {

    }
    
    updateInvitationDetail(data: any) {
        this.invitationDetail.next(data);
        }

    updatecurrentRoute(data: string) {
      //console.log("data.....",data);
      
      this.selectCurrentRoute.next(data);
      }    
    

}  

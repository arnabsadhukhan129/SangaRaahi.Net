import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private snackBar: MatSnackBar) { }
  
  error(message: string) {
    this.snackBar.open(message, undefined, {
      panelClass:['snackbar-error']
    });
  }

  success(message:string) {
    this.snackBar.open(message, undefined, {
      panelClass:['snackbar-success']
    });
  }

  message(message:string, action:string, config:any):MatSnackBarRef<any> {
    return this.snackBar.open(message, action, config);
  }
}

// import { ApplicationRef, ComponentRef, Injectable, Injector, ViewContainerRef } from '@angular/core';
// import { Observable, Subject } from 'rxjs';
// import { EventTypes } from '../models/event-types.model';
// import { ToastEvent } from '../models/toast-events.model';
// // import Swal from 'sweetalert2';

// @Injectable({
//   providedIn: 'root'
// })
// export class AlertService {

//   toastEvents: Observable<ToastEvent>;
//   private _toastEvents = new Subject<ToastEvent>();

//   constructor(
//   ) {
//     this.toastEvents = this._toastEvents.asObservable();
//   }

//   error(message: string, title: string = "Error") {
//     this._toastEvents.next({
//       message,
//       title,
//       type: EventTypes.Error,
//     });
//   }

//   success(message: string, title: string = "Success") {
//     this._toastEvents.next({
//       message,
//       title,
//       type: EventTypes.Success,
//     });
//   }


// }

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hasNewNotificationsFlag = false;
  constructor() { }

  addNotification() {
    // ... your existing code ...
    this.hasNewNotificationsFlag = true;
  }

  hasNewNotifications(): boolean {
    return this.hasNewNotificationsFlag;
  }
}

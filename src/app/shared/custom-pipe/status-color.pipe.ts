// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'statusColor'
// })
// export class StatusColorPipe implements PipeTransform {
//   transform(value: string): string {
//     if (!value) return 'black';
//     switch (value.toUpperCase()) {
//       case 'CREATE':
//         return '#28a745'; // Green
//       case 'UPDATE':
//         return '#8ec3fcff'; // Blue
//       case 'DELETE':
//         return '#dc3545'; // Red
//       case 'LOG_IN':
//         return '#17a2b8'; // Cyan
//       case 'PAYMENT_UPDATE':
//         return '#f37cf7ff'; // Yellow
//       case 'STATUS_CHANGE':
//         return '#5dd6f5ff'; // Purple
//       case 'ONBOARD':
//         return '#20c997'; // Teal
//       case 'PROFILE_UPDATE':
//         return '#b68b68ff'; // Orange
//       case 'ACCEPTED':
//         return '#28a745';
//       case 'REJECTED':
//         return '#dc3545';
//         case 'UPDATE_ANNOUNCEMENT_SETTINGS':
//         return '#f37cf7ff'; // Yellow
//       case 'EXPORT':
//         return '#ff9800'; // Orange
//       case 'CANCEL':
//         return '#ff5722'; // Deep Orange
//       case 'UPDATE_RSVP_ADMINCONTROLL':
//         return '#9c27b0'; // Purple
//       default:
//         return '#343a40'; // Dark gray for unknown
//     }
//   }
// }


import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '#343a40'; // Default dark gray for empty

    switch (value.toUpperCase()) {

      //Common CRUD Actions
      case 'CREATE': return '#28a745'; // Green
      case 'UPDATE': return '#42a5f5'; // Blue
      case 'DELETE': return '#dc3545'; // Red
      case 'DELETE_OWN_ACCOUNT': return '#f44336'; // Bright Red
      case 'CANCEL': return '#ff5722'; // Deep Orange
      case 'EXPORT': return '#ff9800'; // Orange
      case 'EXPORT_GROUP_WISE': return '#a625daff'
      case 'EXPORT_FAMILY_WISE': return '#a175b3ff'

      //User Actions
      case 'LOG_IN': return '#17a2b8'; // Cyan
      case 'ONBOARD': return '#20c997'; // Teal
      case 'PROFILE_UPDATE': return '#b68b68'; // Brownish Orange
      case 'LEAVE': 
      case 'LEAVE_GROUP': return '#ef5350'; // Red Accent

      //Family / Favorite / Volunteer
      case 'ADD': return '#4caf50'; // Green
      case 'ADD_FAMILYMEMBER': return '#81c784'; // Light Green
      case 'REMOVE_FAMILYMEMBER': return '#e53935'; // Red
      case 'ADDTOFAVOURITE': return '#fdd835'; // Yellow
      case 'REMOVETOFAVOURITE': return '#f44336'; // Red
      case 'SELF_VOLUNTEER': return '#00bcd4'; // Cyan

      //Attendance / RSVP
      case 'ATTENDING': return '#66bb6a'; // Green
      case 'NOT_ATTENDING': return '#f44336'; // Red
      case 'UPDATE_RSVP_ADMINCONTROLL':
      case 'UPDATE_RSVP_ADMINCONTROLL'.toUpperCase():
        return '#9c27b0'; // Purple

      //Payment & Finance
      case 'PAYMENT_UPDATE': return '#fbc02d'; // Yellow
      case 'PAYMENT_DELETE': return '#e53935'; // Red

      //Status & Settings
      case 'STATUS_CHANGE': return '#5dd6f5'; // Sky Blue
      case 'UPDATE_COMMUNITY_SETTINGS': return '#673ab7'; // Deep Purple
      case 'SMS_EMAIL_UPDATE': return '#ffb74d'; // Orange
      case 'PUBLICITY_PAGE_STATUS_CHANGE': return '#607d8b'; // Blue Gray
      case 'UPDATE_ANNOUNCEMENT_SETTINGS': return '#ffca28'; // Amber
      case 'SWITCH_COMMUNITY' : return '#6879c4ff'
      case 'UPDATE_QUANTITY' : return '#f57c00' // Dark Orange

      //Member & Role Actions
      case 'ADD_MEMBER': return '#4caf50'; // Green
      case 'PROMOTION': return '#009688'; // Teal
      case 'DEMOTION': return '#e91e63'; // Pink
      case 'ASSIGNMEMBER': return '#29b6f6'; // Light Blue
      case 'DELETE_ASSIGN_MEMBER': return '#ef5350'; // Red
      
      //Invitation & Reminder
      case 'RESENDINVITATION': return '#f6297fff'; // Pinkish Red
      

      //System Status
      case 'ACCEPTED': return '#28a745'; // Green
      case 'REJECTED': return '#dc3545'; // Red

      //Unknown / Default
      default: return '#343a40'; // Dark gray for unrecognized actions
    }
  }
}

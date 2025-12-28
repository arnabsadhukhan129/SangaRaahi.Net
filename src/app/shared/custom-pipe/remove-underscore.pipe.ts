import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderscore'
})
export class RemoveUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Special case for UPDATE_RSVP_ADMINCONTROLL
    if (value === 'UPDATE_RSVP_ADMINCONTROLL') {
      return 'Event Reminder';
    }

    // Remove underscores and split words
    const formatted = value.replace(/_/g, ' ').toLowerCase();

    // Capitalize first letter of each word
    return formatted.replace(/\b\w/g, char => char.toUpperCase());
  }
}

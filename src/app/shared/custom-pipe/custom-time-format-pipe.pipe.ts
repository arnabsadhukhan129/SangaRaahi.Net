import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
@Pipe({
  name: 'customTimeFormatPipe'
})
export class CustomTimeFormatPipePipe implements PipeTransform {
  transform(value: any): string {
    // Check if the value matches the "HH:mm:ss" format
    const formattedTime = new Date(`2000-01-01T${value}`);
    const datePipe = new DatePipe('en-US');
    const timeInAMPMFormat = datePipe.transform(formattedTime, 'h:mm a');
    if(timeInAMPMFormat) {
      return timeInAMPMFormat;
    } else {
      return 'Invalid Time Format';
    }
  }

}

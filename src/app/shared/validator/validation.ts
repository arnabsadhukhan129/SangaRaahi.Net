import { AbstractControl, ValidationErrors } from '@angular/forms';  
    
export class validation {  
    static cannotContainSpace(control: AbstractControl) : ValidationErrors | null {  
        if (control.value && control.value.startsWith(' ')) {
            return {cannotContainSpace: true};
          }
        return null;  
    }  
}  

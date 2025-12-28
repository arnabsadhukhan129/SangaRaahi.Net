import { Injectable } from '@angular/core';
import { AbstractControl,ValidationErrors,ValidatorFn } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  isEmpty(control: AbstractControl){
    const value = control.value;
    if(value == '' || value == null){
      return { InvalidValue: true }
    }
    return null;
  };

  isSpace(control: AbstractControl){
    const value = control.value;
    const regex = /(.|\s)*\S(.|\s)*/;
    if(!value.match(regex)){
      return { invalidSpace: true }
    }
    return null;
  };

  // isSpecialCharacter(control: AbstractControl){
  //   const value = control.value;
  //   const regex = /^(?!.*$).*/;
  //   //const regex =/^(.*?![^\na-z0-9]{2})(?=.*[a-z0-9]$).*$/gim;
  //   if(!value.match(regex)){
  //     return { invalidSpecialCharacter: true }
  //   }
  //   return null;
  // };

  // checkPinCode(control: AbstractControl){
  //   const value = control.value;
  //   const regex = /^\d{5,6}$/;
  //   if(!value.match(regex)){
  //     return { invalidPin: true }
  //   }
  //   return null;
  // };

  checkPinCode(control: AbstractControl){
    const value = control.value;
    const regex = /^\s*([A-Za-z0-9]{5,6})?$/;
    if(!value.match(regex)){
      return { invalidPin: true }
    }
    return null;
  };

  checkPinCodeIN_UK(control: AbstractControl){
    const value = control.value;
    const regex = /^\s*([A-Za-z0-9]{6})?$/;
    if(!value.match(regex)){
      return { invalidPinIN_UK: true }
    }
    return null;
  };

  isMobileNumber(control: AbstractControl){
    const value = control.value;
    const regex = /^(\+\d{1,3}[- ]?)?\d{10,11}$/;
    if(!value.match(regex)){
      return { invalidMobile: true }
    }
    return null;
  };

  isEmail(control: AbstractControl){
    const value = control.value;
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!value.match(regex)){
      return { invalidEmail: true }
    }
    return null;
  };

  isLong(control: AbstractControl){
    const value = control.value;
    const regex = /^\s*(?:\S+(?:\s+\S+){0,99}\s*)?$/;
    if(!value.match(regex)){
      return { limitCross: true }
    }
    return null;
  };

  nameIsLong(control: AbstractControl){
    const value = control.value;
    const regex = /^\s*(?:\S+(?:\s+\S+){0,9}\s*)?$/;
    if(!value.match(regex)){
      return { longName: true }
    }
    return null;
  };

  noSpace(control: AbstractControl){
    const value = control.value;
    var regex = /^\S*$/;
    if(!value.match(regex)){
      return { hasSpace: true }
    }
    return null;
  };

  labelIsLong(control: AbstractControl){
    const value = control.value;
    const regex = /^\s*([A-Za-z0-9(-_&^%!)]{5,30})?$/;
    if(!value.match(regex)){
      return { longLabel: true }
    }
    return null;
  };

  noSlash(control: AbstractControl){
    const value = control.value;
    //Slash is not allowed at the start time........
    // var regex = /^(?!\/)[A-Za-z0-9(\d\/)]*$/;

    //Slash is prohibited..........
    var regex = /^(?!\/)[A-Za-z0-9_&^%!@*-]*$/;
    if(!value.match(regex)){
      return { hasSlash: true }
    }
    return null;
  };

  isURL(control: AbstractControl){
    const value = control.value;
    var regex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    if(!value.match(regex)){
      return { hasURL: true }
    }
    return null;
  };

  isMailLong(control: AbstractControl){
    const value = control.value;
    const regex = /^\s*(?:\S+(?:\s+\S+){0,20}\s*)?$/;
    if(!value.match(regex)){
      return { limitSubject: true }
    }
    return null;
  };

  isSameWord(control: AbstractControl){
    const value = control.value;
    const checkValue = "SangaRaahi";
    if(value.includes(checkValue)){
      return { sameWord: true }
    }
    return null;
  };
}


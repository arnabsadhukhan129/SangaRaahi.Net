import {
  Component,
  DoCheck,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';

declare const $: any;

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit, AfterViewInit, DoCheck, OnChanges {
  otpForm!: FormGroup;
  siteKey: string = environment.siteKey;
  submitted = false;
  disabledButton = false;
  userId!: string;
  disableOtpResend = false;

  // @ViewChild('focus_field') focus_field!: ElementRef<HTMLInputElement>;
  @ViewChild('invisibleInput') invisibleInput!: ElementRef<HTMLInputElement>;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  ngAfterViewInit(): void {
    // this.focus_field.nativeElement.focus();
  }

  ngDoCheck(): void {
    // if (this.otpForm.valid) {
    //   this.invisibleInput.nativeElement.focus();
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  onCaptchaResolved(token: any): void {
    console.log('Captcha resolved with token:', token);
    setTimeout(() => this.invisibleInput.nativeElement.focus(), 0);
  }

  private init(): void {
    this.otpForm = new FormGroup({
      otpNum: new FormControl('',[Validators.required]),
      // first_number: new FormControl('', [Validators.required]),
      // second_number: new FormControl('', [Validators.required]),
      // third_number: new FormControl('', [Validators.required]),
      // fourth_number: new FormControl('', [Validators.required]),
      // fifth_number: new FormControl('', [Validators.required]),
      // sixth_number: new FormControl('', [Validators.required]),
      recaptcha: new FormControl(null, [Validators.required])
    });
  }
  numericOnly(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;

    // Allow navigation keys and backspace/delete
    if ([8, 9, 46, 37, 38, 39, 40].includes(charCode)) return true;

    // Allow digits 0–9
    if (charCode >= 48 && charCode <= 57) return true;

    event.preventDefault();
    return false;
  }

  // Extra safety: in case someone pastes text
  enforceMaxLength(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 6) {
      input.value = input.value.slice(0, 6);
    }
  }



  submit(): void {
    this.disabledButton = true;
    const otp = this.otpForm.value.otpNum;
    console.log("otp======",otp);

    // const otp = [
    //   'first_number',
    //   // 'second_number',
    //   // 'third_number',
    //   // 'fourth_number',
    //   // 'fifth_number',
    //   // 'sixth_number'
    // ]
    //   .map(key => this.otpForm.controls[key].value)
    //   .join('');

    // if (otp.length !== 6 || otp.includes('') || otp.includes(null)) {
    if (otp.length !== 6 || otp.trim().length !== 6) {
      this.alertService.error('OTP is required');
      this.disabledButton = false;
      return;
    }

    if (!this.otpForm.controls['recaptcha'].value) {
      this.alertService.error('Recaptcha is missing');
      this.disabledButton = false;
      return;
    }

    const data = { data: { otp: parseInt(otp) } };
    this.submitted = true;
    this.loaderService.show();

    this.apolloClient.setModule('verifyOtp').mutateData(data).subscribe((response: any) => {
      this.loaderService.hide();

      if (response.error) {
        this.alertService.error(response.message);
      } else {
        const token = response.data.token.accessToken;
        this.userId = response.data.user.id;
        this.storageService.setLocalStorageItem('userId', this.userId);
        this.storageService.setLocalStorageItem('currency', response.data.orgCurrency);
        this.authService.setToken(token);
        this.router.navigateByUrl('/dashboard');
      }
    });
  }

  otpResend(): void {
    if (!this.disableOtpResend) {
      this.authService.resendOtpRefreshToken();
      this.disableOtpResend = true;
      setTimeout(() => (this.disableOtpResend = false), 20000);
    }
  }

  filterCharOnKeyDown(current: KeyboardEvent, currentFieldID: string): boolean | void {
    if (current.key.length >= 1) {
      if (['ArrowRight', 'ArrowLeft', 'Tab', 'ArrowUp', 'ArrowDown', 'Shift', 'Control', 'Alt'].includes(current.key))
        return;
      if (current.key !== 'Backspace' && current.key !== 'Delete') {
        if (isNaN(Number(current.key))) {
          return false;
        } else {
          setTimeout(() => {
            let currentField: any = document.getElementById(currentFieldID);
            currentField.type = 'password';
          }, 500);
        }
      }
    }
  }

  movetoNext(current: KeyboardEvent, nextFieldID: string): boolean | void {
    if (current.key.length >= 1) {
      if (['ArrowRight', 'ArrowLeft', 'Tab', 'ArrowUp', 'ArrowDown', 'Shift', 'Control', 'Alt'].includes(current.key))
        return;
      if (current.key !== 'Backspace' && current.key !== 'Delete') {
        if (isNaN(Number(current.key))) {
          return false;
        }
        if (nextFieldID) {
          setTimeout(() => document.getElementById(nextFieldID)?.focus(), 20);
        }
      } else {
        let prevEle = $(current.target).prev();
        if (prevEle) prevEle.focus();
      }
    }
  }

  movetoPrev(current: KeyboardEvent, prevFieldID: string): void {
    if (current.key.length <= 1) {
      document.getElementById(prevFieldID)?.focus();
    }
  }

  onEnterKey(event: Event): void {
    if (this.otpForm.valid) {
      this.submit();
    } else {
      (event as KeyboardEvent).preventDefault();
    }
  }
}

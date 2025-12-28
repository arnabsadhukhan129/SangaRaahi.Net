import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { CommonService } from '../../../services/common.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { paramService } from 'src/app/shared/params/params';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Subscription } from 'rxjs';
declare var window:any;

@Component({
  selector: 'app-sms-verify',
  templateUrl: './sms-verify.component.html',
  styleUrls: ['./sms-verify.component.css']
})
export class SmsVerifyComponent implements OnInit,OnDestroy {
  filteredOptions!: Array<CountryCodes>;
  countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  phoneVerificationForm!: FormGroup;
  otpSubmissionForm!: FormGroup;
  communityDetails!: any;
  isVerified: boolean = false;
  phoneSubscriber!:Subscription;
  otpSubscriber!: Subscription;
  $phoneModal: any;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private formBuilder : FormBuilder,
    private commonService : CommonService,
    private validator: ValidatorService,
    private sanitizer: DomSanitizer,
    private paramService : paramService,
    private fileUploadService: FileUploadService
  ){}

  ngOnInit(): void {
    this.initForm();
    this.initOtpForm();
    this.getCountryCodes();
    this.getCommunityDetails();
  }

  ngOnDestroy(): void {
    if(this.phoneSubscriber){
      this.phoneSubscriber.unsubscribe();
    }
    if(this.otpSubscriber){
      this.otpSubscriber.unsubscribe();
    }
  }

  initForm(){
    this.phoneVerificationForm = this.formBuilder.group({
      phoneCode: [''],
      phone: ['']
    })
  }

   initOtpForm(){
      this.otpSubmissionForm = this.formBuilder.group({
        otp: ['',[Validators.required]]
      })
    }

  /**Search Country...... */
     searchCountry(event:any){
      this._filter(event.target.value)
    }
  
    private _filter(value: string) {
      const filterValue = value.toLowerCase();
      this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
      // console.log("filteredOptions=====>",this.filteredOptions);
      
      if(this.filteredOptions.length == 0){
        //this.loginForm.controls['countryCode'].reset()
      }
    }
  
    addCountryCode(country:CountryCodes){
      this.selectedCountryCode = country;
      //console.log("country............",this.selectedCountryCode);
    }
  
    getCountryCodes() {
      this.loaderService.show();
      this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {    
        this.loaderService.hide();
        if(response.error) {
          this.alertService.error(response.message);
        } else {
          this.countryCodes = response.data;      
          this.filteredOptions = response.data;
          //console.log(this.filteredOptions); 
        }
      });
    }

    getCommunityDetails(){
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunitiesView').queryData().subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.communityDetails = response.data;
        console.log(this.communityDetails);
        this.isVerified = this.communityDetails?.myCommunities?.smsAppNumber?.isVerified;
        this.phoneVerificationForm.patchValue({
          phoneCode: this.communityDetails.myCommunities.smsAppNumber.phoneCode ? this.communityDetails.myCommunities.smsAppNumber.phoneCode : '',
          phone: this.communityDetails.myCommunities.smsAppNumber.number ? this.communityDetails.myCommunities.smsAppNumber.number : ''
        })
        // console.log("communityDetails======>>>>>",this.communityDetails);
        
      }
    });
  }


   /**Using for send otp to email */
    emailOpenModal() {
      const formValue = this.phoneVerificationForm.value;
      const params: any = {
        data: {
          phoneCode: formValue.phoneCode,
          phone: formValue.phone
        }
      };

      this.loaderService.show();
      this.phoneSubscriber = this.apolloClient
        .setModule('smsAppVerifyByWeb')
        .mutateData(params)
        .subscribe((response: any) => {
          this.loaderService.hide();
          if (response.error) {
            this.alertService.error(response.message);
          } else {
            this.$phoneModal = new window.bootstrap.Modal(
              document.getElementById('emailVerifyModal')
            );
            this.$phoneModal.show();
          }
        });
    }


  /**Using for close the phone modal */
  closeEmailModal(){
    this.$phoneModal.hide();
    this.otpSubmissionForm.controls['otp'].setValue('');
  }

  /**Using for submit the otp */
  otpSubmit(){
    const getOtp = parseInt(this.otpSubmissionForm.value.otp);
    const formValue = this.phoneVerificationForm.value;
    const params: any ={};
    params['data']={
      otp: getOtp,
      phone: formValue.phone
    }
    this.otpSubscriber = this.apolloClient.setModule('smsAppOtpVerifyByWeb').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
      } else {
        this.loaderService.hide();
        this.alertService.error("Otp Verification Successfully!");
        this.otpSubmissionForm.controls['otp'].setValue('');
        this.$phoneModal.hide();
        this.router.navigateByUrl('/community-management')
      }
    });
  }

  backPreviousPage(){
    this.router.navigateByUrl('/community-management');
  }

  submitOTPData(){
    const formValue = this.phoneVerificationForm.value;
    if(!formValue.phoneCode){
      this.alertService.error("Please choose phone code");
      return;
    }
    if(!formValue.phone){
      this.alertService.error('Please enter phone number');
      return;
    }
    const params: any = {
      data: {
        phoneCode: formValue.phoneCode,
        number: formValue.phone
      }
    };
    this.loaderService.show();
    this.apolloClient.setModule("updateCommunityView").mutateData(params).subscribe((response:any) => {
      if(response.error){
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
       else{
        this.getCommunityDetails();
        this.loaderService.hide();
        this.alertService.error(response.message);
       }
    });

  }
}

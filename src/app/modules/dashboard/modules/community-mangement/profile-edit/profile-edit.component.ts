import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveMemberDetails } from 'src/app/shared/typedefs/custom.types';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { CommonService } from '../../../services/common.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import { paramService } from 'src/app/shared/params/params';
import { Subscription } from 'rxjs';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { arrayBuffer } from 'stream/consumers';
declare var window:any;
@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit,OnDestroy {
  curencyAddSubscriber!: Subscription;
  emailSubscriber!: Subscription;
  otpSubscriber!: Subscription;
  communityDetails!: any;
  communityDetailsForm!: FormGroup;
  enableEditOption: boolean = false;
  states : any = [];
  filteredOptions!: Array<CountryCodes>;
  countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  imageSrc!: any;
  countryCode!:any;
  email!:any;
  phone!:number;
  phonecode!:number;
  comName!: string;
  //image!: any;
  image: any = "assets/images/header-user.png";
  imageChangedEvent: any;
  croppedImage: any;
  openCropImageModal: boolean= false;
  getFileName: any;
  communitieSlug!: string;
  communityFlagCode: any;
  announcementCheckbox!:boolean;
  videoCheckbox!:boolean;
  paymentCheckbox!:boolean;
  aboutUsCheckbox!: boolean;
  $modal: any;
  currencyForm!: FormGroup;
  $emailModal: any;
  otpSubmissionForm!: FormGroup;
  isOtpVerified: boolean = false;
  getEmail!: string;
  hasChangeCurrency: any;
  getCurrency!: string;
  getbas64URL: any;
  previewImg: any;
  imageUrl: any;
  
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
    private StorageService: StorageService,
    private fileUploadService: FileUploadService
  ){
    this.commonService.sendSearch("no search");
  }
  ngOnInit(): void {
    this.comName = this.storageService.getLocalStorageItem('communityName');
    this.initForm();
    this.initCurrencyForm();
    this.getCommunityDetails();
    this.getActiveMemberDetails();
    this.getCommunitySettingsViewDetails();
    this.getCurrencyByCommunityId();
    this.initOtpForm();
    this.getCountryCodes();
  }
  
  ngOnDestroy(): void {
    this.getCommunityDetails();
    this.getActiveMemberDetails();
  }

  initForm(){
    this.communityDetailsForm = this.formBuilder.group({
      logoImage: [''],
      communityEmail: ['',[Validators.required]],
      communityPhoneCode:[''],
      communityNumber: ['',[Validators.required,this.validator.isEmpty,this.validator.isMobileNumber]],
      firstAddressLine: ['',[Validators.required]],
      secondAddressLine: [''],
      country: [''],
      state: ['',[Validators.required]],
      city: ['',[Validators.required]],
      zipcode:['',[Validators.required,this.validator.isEmpty,this.validator.checkPinCode]]
    })
  }

  initCurrencyForm(){
    this.currencyForm = this.formBuilder.group({
      currency: new FormControl(this.StorageService.getLocalStorageItem('currency'))
    })
  }

  initOtpForm(){
    this.otpSubmissionForm = this.formBuilder.group({
      otp: ['',[Validators.required]]
    })
  }

  getCommunityDetails(){
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunitiesView').queryData().subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.communityDetails = response.data;
        this.isOtpVerified = this.communityDetails.myCommunities?.communityEmailApproval;
        this.image = this.communityDetails.myCommunities.logoImage ? this.communityDetails.myCommunities.logoImage : 'assets/images/header-user.png';
        this.hasChangeCurrency = this.communityDetails.myCommunities?.currencyRestriction;
        this.commonService.sendImage(this.image);
        this.getCountry(this.communityDetails.myCommunities.address.country,this.communityDetails);
        // if(this.states){
        //   this.patchData(this.communityDetails);
        // }
      }
    });
  }

  patchData(communityDetails:any){
    if(communityDetails.myCommunities.address.country.trim() === "India"){
      this.communityFlagCode = "+91";
    }
    else if(communityDetails.myCommunities.address.country.trim() === "Canada"){
      this.communityFlagCode = "+1";
    }
    else if(communityDetails.myCommunities.address.country.trim() === "United Kingdom"){
      this.communityFlagCode = "+44";
    }
    else if(communityDetails.myCommunities.address.country.trim() === "United States"){
      this.communityFlagCode = "+1";
    }
    this.communityDetailsForm.patchValue({
      logoImage: communityDetails.myCommunities.logoImage ? communityDetails.myCommunities.logoImage : '',
      communityEmail: communityDetails.myCommunities.communityEmail ? communityDetails.myCommunities.communityEmail : '',//this.email,
      communityNumber: communityDetails.myCommunities.communityNumber ? communityDetails.myCommunities.communityNumber : '',//this.phone,
      communityPhoneCode: this.communityFlagCode ?  this.communityFlagCode : '',
      firstAddressLine: communityDetails.myCommunities.address.firstAddressLine ? communityDetails.myCommunities.address.firstAddressLine : '',
      secondAddressLine: communityDetails.myCommunities.address.secondAddressLine ? communityDetails.myCommunities.address.secondAddressLine : '',
      country: communityDetails.myCommunities.address.country ? communityDetails.myCommunities.address.country.trim() : '',
      state: communityDetails.myCommunities.address.state ? communityDetails.myCommunities.address.state.trim() : '',
      city: communityDetails.myCommunities.address.city ? communityDetails.myCommunities.address.city : '',
      zipcode: communityDetails.myCommunities.address.zipcode ? communityDetails.myCommunities.address.zipcode : '',
    });
    this.getEmail = communityDetails.myCommunities.communityEmail ? communityDetails.myCommunities.communityEmail : '';
  }

  editDetails(){
    this.enableEditOption = true;
  }


  getCountry(country:any,communityDetails:any) {
    this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.countryCodes = response.data;
        this.countryCode = this.countryCodes.find((val)=>{
          return (val['name']).trim() === country.trim();
        });
        if(this.countryCode){
          this.getState(this.countryCode.code,communityDetails);
        }
      }
    });
  }

  changeState(code:any){
    //this.hasCountry = true;
    const params= {
      data:{
        countryCode: code.target.value
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.states = response.data;
      }
    });
  }

  getState(code:any,communityDetails:any){
    //this.hasCountry = true;
    const params= {
      data:{
        countryCode: code
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.states = response.data;
        this.patchData(communityDetails);
      }
    });
  }

  previewImage(event:any){
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.openCropImageModal = true;
    this.imageChangedEvent = event;
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.imageSrc = event.target?.result;
        // console.log("imageSrc=====",this.imageSrc);  
      }
    }
    //this.uploadFileToS3Bucket(this.imageChangedEvent);
  }

  getActiveMemberDetails(){
    const id = this.storageService.getLocalStorageItem('userId');
    const params = {
      data:{
        id: id
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberDetails').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.email = response.data.user.email;
        this.phone = response.data.user.phone;
        this.phonecode = response.data.user.phoneCode;
      }
    });
  }

  saveDetails(){
    this.enableEditOption = false;
    const saveData = this.communityDetailsForm.value;
    if(this.getEmail !== saveData.communityEmail){
      this.isOtpVerified = false;
    }
    
    //saveData.logoImage = this.image;
    //return;    
    const params:any={};
    params['data']={
      logoImage : this.image,
      communityEmail: saveData.communityEmail ? saveData.communityEmail : '',
      communityPhoneCode: saveData.communityPhoneCode ? saveData.communityPhoneCode : '',
      communityNumber: saveData.communityNumber ? saveData.communityNumber : '', 
      firstAddressLine: saveData.firstAddressLine ? saveData.firstAddressLine : '',
      secondAddressLine: saveData.secondAddressLine ? saveData.secondAddressLine : '',
      city: saveData.city ? saveData.city : '',
      state: saveData.state ? saveData.state : '',
      zipcode: saveData.zipcode ? saveData.zipcode : '' 
    }
    this.loaderService.show();
    this.apolloClient.setModule("updateCommunityView").mutateData(params).subscribe((response:any) => {
      if(response.error){
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
       else{
        this.commonService.sendImage(this.image);
        //this.storageService.setLocalStorageItem('communitylogo',this.image);
        this.loaderService.hide();
        this.alertService.error(response.message);
        //this.router.navigateByUrl('active-members/track')
       }
    });
  }


  //Image Croped...............
    cropImg(event: any) {
      const blob = event.blob;
      // this.fileUploadService.blobToArrayBuffer(blob).then(arrayBuffer => {
      //   const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', blob.type);
      //   this.imageUrl = file; // File is a subtype of Blob, so OK
      // }).catch(err => {
      //   console.error("Error converting blob to ArrayBuffer:", err);
      // });
      if (blob && blob.type.startsWith('image/')) {
        this.fileUploadService.blobToArrayBuffer(blob).then(arrayBuffer => {
          const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', blob.type);
          this.imageUrl = file;
        }).catch(err => {
          console.error("Error converting blob to ArrayBuffer:", err);
        });
      } else {
        console.error("Invalid blob type:", blob?.type);
      }
    }




    imgLoad() {
      // display cropper tool
    }
    initCropper() {
      // cropper ready
    }
    imgFailed() {
      // show message
    }

  uploadFileToS3Bucket(fileName: any) {
    //console.log("fileName",fileName);
    
    //return;
    // const file = fileName.target.files[0] ? fileName.target.files[0] : '';
    // console.log("croppedImage..........",fileName.target.files[0]);
    // const files = fileName.target.files ? fileName.target.files : '';
    if (fileName) {
      const bucket = new S3(
        {
          accessKeyId: environment.AWS_ACCESS_KEY,
          secretAccessKey: environment.AWS_SECRET_KEY,
          region: environment.AWS_REGION
        }
      );
      //this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(fileName)
      // upload file to the bucket...........  
      const params = {
            Bucket: environment.BUCKET_NAME,
            Key: this.getFileName,         
            Body: fileName,
            ACL: 'public-read'
        };  
        //console.log("params..........",params);  
      bucket.upload(params,  (err: any, data: any) => {
        if (err) {
          //console.log('There was an error uploading your file: ', err);
          this.alertService.error("There was an error uploading your file");
          return false;
        }
  
        else {
          //this.alertService.error("Successfully uploaded file.");
          this.image = data.Location;
          // console.log("image..........",this.image);
          
          return true;
        }
      });
    }else {
      this.alertService.error("No file uploaded.");
    }
    
  }

  isNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }

  globalSetting(){
    this.paramService.updatecurrentRoute('/community-management/global-setting');
    this.router.navigateByUrl('community-management/global-setting');
  }

  editWebPage(){
    this.router.navigateByUrl('community-management/edit-webpage')
  }

  back(){
    this.paramService.updatecurrentRoute('/dashboard');
    this.router.navigateByUrl('/dashboard');
  }
  
  saveImage() {
  this.openCropImageModal = false;
  // console.log("imageUrl.......",this.imageUrl);
  // console.log("imageSrc......",this.imageSrc);
  
  if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
    this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
      this.image = base64; // only for preview
      const formData = new FormData();
      formData.append('type', 'community-profile-image');
      formData.append('images', this.imageUrl); // this.imageUrl is File
      // for (const [key, value] of (formData as any).entries()) {
      //   console.log(`formData key = ${key}`, value);
      // }
      // console.log("formData=====",formData);
      
      this.fileUploadService.sendFile(formData).subscribe({
        next: (res) => {
          // console.log('Upload success:', res);
          this.image = res.urls[0]
        },
        error: (err) => {
          console.error('Upload error:', err);
        }
      });

    }).catch(err => {
      console.error("Error converting to base64:", err);
    });
  } else {
    console.error("Invalid file object:", this.imageUrl);
  }
}



  closeImage(){
    this.openCropImageModal = false;
  }

  viewMyWebsite(){
    //console.log("hiii");
    window.open('https://sangaraahi.org/'+this.communitieSlug+'/Home');
    //this.router.navigateByUrl('http://demoyourprojects.com:5086/');
  }

  getCommunitySettingsViewDetails(){
    const id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data:{
        communityId: id
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunitiesSettingsView').queryData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } 
      else {
        this.communitieSlug = response.data.slug;
        this.announcementCheckbox = response.data?.announcementPage ;
        this.videoCheckbox = response.data?.videoPage ;
        this.paymentCheckbox =  response.data?.paymentPage;
        this.aboutUsCheckbox =  response.data?.aboutPage;
      }
    });
  }


  /**Open modal for currency setting */
  setCurrencyModal(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("eventId_modal")
    );
    this.$modal.show();
  }

   /**Close modal for currency setting */
   closeCurrencyModal(){
    this.$modal.hide();
    this.currencyForm.patchValue({
      currency: this.storageService.getLocalStorageItem('currency')
    })
  }

  /**Using for save currency */
  saveCurrency(){
    const params: any ={};
    const saveCurrencyData = this.currencyForm.value;
    this.StorageService.setLocalStorageItem('currency',saveCurrencyData.currency);
    params['data']={
      communityId : this.storageService.getLocalStorageItem('communtityId'),
      currency: this.storageService.getLocalStorageItem('currency'),
    }
    this.loaderService.show();
    this.curencyAddSubscriber = this.apolloClient.setModule('editCurrency').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.alertService.error(response.message);
        this.getCommunityDetails()
      }
      this.$modal.hide();
      this.loaderService.hide();
    });
  }

  /**Using for send otp to email */
  emailOpenModal(){
    const getEmailData = this.communityDetailsForm.value.communityEmail;
    const params: any ={};
    params['data']={
      email: getEmailData
    }
    this.loaderService.show();
    this.emailSubscriber = this.apolloClient.setModule('verifyCommunityEmail').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
      } else {
        this.loaderService.hide();
        this.$emailModal = new window.bootstrap.Modal(
          document.getElementById("emailVerifyModal")
        );
        this.$emailModal.show();
      }
    });
  }

  /**Using for close the email modal */
  closeEmailModal(){
    this.$emailModal.hide();
    this.otpSubmissionForm.controls['otp'].setValue('');
  }

  /**Using for submit the otp */
  otpSubmit(){
    const getOtp = parseInt(this.otpSubmissionForm.value.otp);
    const params: any ={};
    params['data']={
      otp: getOtp
    }
    this.otpSubscriber = this.apolloClient.setModule('verifyCommunityOTP').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
      } else {
        this.loaderService.hide();
        this.alertService.error("Otp Verification Successfully!");
        this.otpSubmissionForm.controls['otp'].setValue('');
        this.$emailModal.hide();
        this.getCommunityDetails();
      }
    });
  }

  /**Using for clear the address section depends on state change */
  stateChange(){
    this.communityDetailsForm.controls['firstAddressLine'].setValue('');
    this.communityDetailsForm.controls['secondAddressLine'].setValue('');
    this.communityDetailsForm.controls['city'].setValue('');
    this.communityDetailsForm.controls['zipcode'].setValue('');
  }

  /**Get Currency With Community  Wise*/
  getCurrencyByCommunityId(){
    const param = {
      getCommunityByIdId: this.storageService.getLocalStorageItem('communtityId'),
    }
    this.loaderService.show();
    this.apolloClient.setModule('getCommunityByID').queryData(param).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getCurrency = response.data?.currency;
        this.StorageService.setLocalStorageItem('currency',this.getCurrency);
      }
    })
  }

  /**Search Country...... */
   searchCountry(event:any){
    this._filter(event.target.value)
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
    console.log("filteredOptions=====>",this.filteredOptions);
    
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
}

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as S3 from 'aws-sdk/clients/s3';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import {environment} from 'src/environments/environment';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { event } from 'jquery';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
declare var window:any;
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit,OnDestroy {
  @ViewChild('userImg') userImg!: ElementRef;
  @ViewChild('communityImg') communityImg!: ElementRef;
  siteKey:string =environment.siteKey;
  signUpForm!:FormGroup
  image: any;
  userImage: any;
  countryCodes!: Array<CountryCodes>;
  countryCodes1!: Array<CountryCodes>;
  filteredOptions!: Array<CountryCodes>;
  filteredOptions1!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  selectedCountryCode1!: CountryCodes;
  code!: string;
  hasCountry: boolean = false;
  getState: any;
  getFileName!: string;
  openCropImageModal: boolean= false;
  openCropUserImageModal: boolean= false;
  imageChangedEvent: any;
  userImageChangedEvent:any;
  imageSrc!: any;
  croppedImage: any;
  userCroppedImage: any;
  istoggleon: boolean = false;
  taxToggle: boolean = false;
  private countrySubscriber!: Subscription;
  private stateSubscriber!: Subscription;
  private detailsSaveSubscriber!: Subscription;
  isFieldDisabled: boolean = true;
  $modal: any;
  arrYear: any;
  imageUrl:any;
  imageUrl1:any;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private formBuilder : FormBuilder,
    private validator: ValidatorService,
    private router: Router,
    private fileUploadService: FileUploadService
  ){}

  ngOnInit(): void {
    this.initForm();
    this.getCountryCodes();
    this.getYear();
  }
  
  ngOnDestroy(): void {
    if(this.countrySubscriber){
      this.countrySubscriber.unsubscribe();
    }

    if(this.stateSubscriber){
      this.stateSubscriber.unsubscribe();
    }

    if(this.detailsSaveSubscriber){
      this.detailsSaveSubscriber.unsubscribe();
    }

  }
  initForm(){
    this.signUpForm = this.formBuilder.group({
      firstName: ['',[Validators.required, this.validator.isEmpty]],
      //creatorEmail: ['',[Validators.required,this.validator.isEmpty,this.validator.isEmail]],
      //CreatorscountryCode: ['',[Validators.required, this.validator.isEmpty]],
      countryCode1: ['',[Validators.required, this.validator.isEmpty]],
      creatorsphone: ['',[Validators.required, this.validator.isEmpty, this.validator.isMobileNumber]],
      // middleName: [''],
      // lastName: ['',[Validators.required, this.validator.isEmpty]],
      email: ['',[Validators.required, this.validator.isEmpty,this.validator.isEmail]],
      yearOfBirth: ['',[Validators.required, this.validator.isEmpty]],
      communityName: ['',[Validators.required, this.validator.isEmpty]],
      communityEmail: ['',[Validators.required, this.validator.isEmpty,this.validator.isEmail]],
      communityType: ['',[Validators.required, this.validator.isEmpty]],
      communityCategory: ['',[Validators.required, this.validator.isEmpty]],
      communityDescription: [''],
      adressLine1: ['',[Validators.required, this.validator.isEmpty]],
      adressLine2: [''],
      countryCode: ['',[Validators.required, this.validator.isEmpty]],
      phone: ['',[Validators.required, this.validator.isEmpty, this.validator.isMobileNumber]],
      country: ['',[Validators.required, this.validator.isEmpty]],
      state: ['',[Validators.required, this.validator.isEmpty]],
      city: ['',[Validators.required, this.validator.isEmpty]],
      zipcode: ['',[Validators.required, this.validator.isEmpty]],
      showProfileOrganization: [''],
      nonProfitTax: [''],
      recaptcha: ['']
    })
  }
  
  /**Using for country search */
  searchCountry(event:any){
    this._filter(event.target.value);
  }

  /**Using for country search */
  searchCountry1(event:any){
    this._filter1(event.target.value);
  }

  /**Using for filter the country */
  private _filter1(value: string) {
    const filterValue1 = value.toLowerCase();
    this.filteredOptions1 = this.countryCodes1.filter(countryCode1 => countryCode1.name.toLowerCase().includes(filterValue1));
  }

  /**Using for filter the country */
  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
    
  }

  /**Using for added the country code */
  addCountryCode(country:CountryCodes){
    this.selectedCountryCode = country;
  }

  /**Using for added the country code */
  addCountryCode1(country1:CountryCodes){
    this.selectedCountryCode1 = country1;
    // console.log("selectedCountryCode1....",this.selectedCountryCode1);
    this.signUpForm.controls['country'].setValue(this.selectedCountryCode1.name);
    this.changeStates(this.selectedCountryCode1.name);
    this.signUpForm.controls['countryCode'].setValue(this.selectedCountryCode1.dialCode);
  }

  /**Using for get the country codes */
  getCountryCodes() {
    this.loaderService.show();
    this.countrySubscriber = this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.countryCodes = response.data;
        this.countryCodes1 = response.data;
        this.filteredOptions = response.data;      
        this.filteredOptions1 = response.data; 
      }
    });
  }

  /**Using for validation(numeric checking)*/
  numericOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
      if ((charCode < 48 || charCode > 57) && charCode !== 190){
      return false;
    }
    return true;
  }

  /**Using for validation(number checking)*/
  isNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }

  /**Using for text convert in capital letter */
  onlyCapsValue(event:any){
    let value = event.target.value;
      value.toUpperCase();
  }

  /**Using for state change in depends on country */
  changeState(code:any){
    if(code.target.value === "Canada"){
      this.code = 'CA';
    }
    if(code.target.value === "India"){
      this.code = 'IN';
    }
    if(code.target.value === "United Kingdom"){
      this.code = 'GB';
    }
    if(code.target.value === "United States"){
      this.code = 'US';
    }
    //this.code = code.target.value;
    this.hasCountry = true;
    const params= {
      data:{
        countryCode: this.code
      }
    }
    this.loaderService.show();
    this.stateSubscriber = this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getState = response.data;
        this.signUpForm.controls['adressLine1'].setValue('');
        this.signUpForm.controls['adressLine2'].setValue('');
        this.signUpForm.controls['state'].setValue('');
        this.signUpForm.controls['city'].setValue('');
        this.signUpForm.controls['zipcode'].setValue('');
      }
    });
  }

    /**Using for state change in depends on country */
    changeStates(CountryName:any){
      if(CountryName === "Canada"){
        this.code = 'CA';
      }
      if(CountryName === "India"){
        this.code = 'IN';
      }
      if(CountryName === "United Kingdom"){
        this.code = 'GB';
      }
      if(CountryName === "United States"){
        this.code = 'US';
      }
      //this.code = code.target.value;
      this.hasCountry = true;
      const params= {
        data:{
          countryCode: this.code
        }
      }
      this.loaderService.show();
      this.stateSubscriber = this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
        this.loaderService.hide();
        if(response.error) {
          this.alertService.error(response.message);
        } else {
          this.getState = response.data;
          this.signUpForm.controls['adressLine1'].setValue('');
          this.signUpForm.controls['adressLine2'].setValue('');
          this.signUpForm.controls['state'].setValue('');
          this.signUpForm.controls['city'].setValue('');
          this.signUpForm.controls['zipcode'].setValue('');
        }
      });
    }

  /**Using for uploaded image preview */
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
      }
      
    }
  }

   /**Using for uploaded user image preview */
   previewUserImage(event:any){
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.openCropUserImageModal = true;
    this.userImageChangedEvent = event;
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.imageSrc = event.target?.result;
      }
      
    }
  }

  /**Using for save the croped image */
  saveImage(){
    this.openCropImageModal = false;
    // this.uploadFileToS3Bucket(this.croppedImage);
    if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.image = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'community-signup-image');
        formData.append('images', this.imageUrl);
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
  
  /**Using for cancel the croped image */
  closeImage(){
    this.openCropImageModal = false;
  }

  /**Using for save the user croped image */
  saveUserImage(){
    this.openCropUserImageModal = false;
    // this.uploadUserFileToS3Bucket(this.userCroppedImage);
     // this.uploadFileToS3Bucket(this.croppedImage);
    if (this.imageUrl1 instanceof File || this.imageUrl1 instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl1).then((base64) => {
        this.userImage = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'user-signup-image');
        formData.append('images', this.imageUrl1);
        this.fileUploadService.sendFile(formData).subscribe({
          next: (res) => {
            // console.log('Upload success:', res);
            this.userImage = res.urls[0]
          },
          error: (err) => {
            console.error('Upload error:', err);
          }
        });
      }).catch(err => {
        console.error("Error converting to base64:", err);
      });
    } else {
      console.error("Invalid file object:", this.imageUrl1);
    }
  }
  
  /**Using for cancel the user croped image */
  closeUserImage(){
    this.openCropUserImageModal = false;
  }

  /**Using for image upload in s3 bucket */
  uploadFileToS3Bucket(fileName: any) {
    if (fileName) {
      const bucket = new S3(
        {
          accessKeyId: environment.AWS_ACCESS_KEY,
          secretAccessKey: environment.AWS_SECRET_KEY,
          // region: 'ap-south-1'  //Asia Pacific (Mumbai)
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
      bucket.upload(params,  (err: any, data: any) => {
        if (err) {
          this.alertService.error("There was an error uploading your file");
          return false;
        }
  
        else {
          //this.alertService.error("Successfully uploaded file.");
          this.image = data.Location;
          return true;
        }
      });
    }else {
      this.alertService.error("No file uploaded.");
    }
  }

   /**Using for user image upload in s3 bucket */
   uploadUserFileToS3Bucket(fileName: any) {
    if (fileName) {
      const bucket = new S3(
        {
          accessKeyId: environment.AWS_ACCESS_KEY,
          secretAccessKey: environment.AWS_SECRET_KEY,
          // region: 'ap-south-1'  //Asia Pacific (Mumbai)
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
      bucket.upload(params,  (err: any, data: any) => {
        if (err) {
          this.alertService.error("There was an error uploading your file");
          return false;
        }
  
        else {
          //this.alertService.error("Successfully uploaded file.");
          this.userImage = data.Location;
          return true;
        }
      });
    }else {
      this.alertService.error("No file uploaded.");
    }
  }

  /**Using for selectd image crop */
  cropImg(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
     if (this.croppedImage && this.croppedImage.type.startsWith('image/')) {
        this.fileUploadService.blobToArrayBuffer(this.croppedImage).then(arrayBuffer => {
          const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.croppedImage.type);
          this.imageUrl = file;
        }).catch(err => {
          console.error("Error converting blob to ArrayBuffer:", err);
        });
      } else {
        console.error("Invalid blob type:", this.croppedImage?.type);
      }
    
  }
  /**Using for selectd image crop */
  userCropImg(event: ImageCroppedEvent) {
    this.userCroppedImage = event.blob;
     if (this.userCroppedImage && this.userCroppedImage.type.startsWith('image/')) {
        this.fileUploadService.blobToArrayBuffer(this.userCroppedImage).then(arrayBuffer => {
          const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.userCroppedImage.type);
          this.imageUrl1 = file;
        }).catch(err => {
          console.error("Error converting blob to ArrayBuffer:", err);
        });
      } else {
        console.error("Invalid blob type:", this.userCroppedImage?.type);
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

  /**Using for legal non profile organization */
  toggleLegalNon(event:any){
    if (event.target.checked === true){
      this.istoggleon = true;
    }
    else{
      this.istoggleon = false;
      this.signUpForm.controls['nonProfitTax'].setValue('');
    }
  }

  /**Using for details save */
  saveData(){
    const INCAregex = /^\s*([A-Za-z0-9]{6})?$/;
    const UKregex = /^\s*([A-Za-z0-9]{5,7})?$/;
    const USregex = /^\s*([0-9]{5,6})?$/;
    const CAregex = /^[A-Z]\d[A-Z]\d[A-Z]\d?$/;
    const UKreg = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if(this.signUpForm.value.country.length!=0){
      if(this.signUpForm.value.country === 'India'){
        if(!this.signUpForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
      }
      if(this.signUpForm.value.country === 'Canada'){
        if(!this.signUpForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
        if(!this.signUpForm.value.zipcode.match(CAregex)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.signUpForm.value.country === 'United Kingdom'){
        if(!this.signUpForm.value.zipcode.match(UKregex)){
          this.alertService.error("Zip code should be between 5 to 7 characters");
          return;
        }
        if(!this.signUpForm.value.zipcode.match(UKreg)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.signUpForm.value.country === 'United States'){
        if(!this.signUpForm.value.zipcode.match(USregex)){
          this.alertService.error("Zip code should be between 5 to 6 characters");
          return;
        }
      }
    }
    if(this.signUpForm.value.showProfileOrganization && this.signUpForm.value.nonProfitTax === '' || this.signUpForm.value.nonProfitTax === null){
      this.alertService.error("Non profit tax id is required");
      return;
    }

    if(this.signUpForm.controls['recaptcha'].value === '' || this.signUpForm.controls['recaptcha'].value === null){
      this.alertService.error("Recaptcha is missing");
      return;
    }
    
    const saveData = this.signUpForm.value;
    // console.log("saveData.....",saveData);
    // return;
    const params:any={};
    params['data']={
      user:{
        name: saveData.firstName ? saveData.firstName : '',
        phone: saveData.creatorsphone ? saveData.creatorsphone : '',
        yearOfBirth: saveData.yearOfBirth ? saveData.yearOfBirth : '',
        //countryCode: saveData.CreatorscountryCode ? saveData.CreatorscountryCode : '',
        //countryCode: this.selectedCountryCode1.code ? this.selectedCountryCode1.code : '',
        // phoneCode: this.selectedCountryCode1.dialCode ? this.selectedCountryCode1.dialCode : '',
        countryCode: this.selectedCountryCode1.code ? this.selectedCountryCode1.code : '',
        phoneCode: this.selectedCountryCode1.dialCode ? this.selectedCountryCode1.dialCode : '',
        email: saveData.email ? saveData.email : '',
        profileImage: this.userImage ? this.userImage : null
      },
      community:{
        communityType: saveData.communityType ? saveData.communityType : '',//"Cultural",
        bannerImage: null,
        logoImage:this.image ? this.image : null,
        communityName: saveData.communityName ? saveData.communityName : '',
        communityEmail: saveData.communityEmail ? saveData.communityEmail : '',
        communityDescription: saveData.communityDescription ? saveData.communityDescription : '',
        communityLocation: null,
        firstAddressLine: saveData.adressLine1 ? saveData.adressLine1 : '',
        secondAddressLine: saveData.addressLine2 ? saveData.addressLine2 : null,
        communityPhoneCode: this.selectedCountryCode1.dialCode ? this.selectedCountryCode1.dialCode : '',
        communityNumber: saveData.phone ? saveData.phone : '',
        city: saveData.city ? saveData.city : '',
        state: saveData.state ? saveData.state : '',
        country: saveData.country ? saveData.country : '',
        zipcode: saveData.zipcode ? saveData.zipcode : '',
        nonProfitTaxId: saveData.nonProfitTax ? saveData.nonProfitTax : null,
        nonProfit: saveData.showProfileOrganization ? saveData.showProfileOrganization : false,
      }
    }
    this.loaderService.show();
    this.detailsSaveSubscriber = this.apolloClient.setModule('userDotNetSignUp').mutateData(params).subscribe((response:any)=> {
      //console.log(response);
      if(response.error){
        console.log(response.error);
        this.loaderService.hide();
        this.alertService.error(response.message);
      }
      else{
        this.loaderService.hide();
        this.$modal = new window.bootstrap.Modal(
          document.getElementById("success_modal")
        );
        this.$modal.show();
      }
    })
  }

  getTax(event:any){
    if(event.target.value!='' && event.target.value === 'NonProfit'){
      this.taxToggle = true;
    }
    else{
      this.taxToggle = false;
      this.signUpForm.controls['showProfileOrganization'].setValue(false);
      this.istoggleon = false;
    }
  }

  deleteUserImage(){
    this.userImage = '';
    this.userImg.nativeElement.value = '';
  }

  deletecommunityImage(){
    this.image = '';
    this.communityImg.nativeElement.value = '';
  }

  redirectToSignIn(){
    this.$modal.hide();
    this.loaderService.show();
    this.router.navigateByUrl('/auth');
    this.loaderService.show();
  }

  /**get year for year of birth */
  getYear(){
    const currentYear = (new Date()).getFullYear();
    const range = (start:any, stop:any, step:any) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    //console.log("year..........",range(currentYear, currentYear - 50, -1));
    this.arrYear = range(currentYear, currentYear - 123, -1);
  }
}

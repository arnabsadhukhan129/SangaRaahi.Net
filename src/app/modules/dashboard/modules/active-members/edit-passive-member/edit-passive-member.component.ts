import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'app-edit-passive-member',
  templateUrl: './edit-passive-member.component.html',
  styleUrls: ['./edit-passive-member.component.css']
})
export class EditPassiveMemberComponent implements OnInit, OnDestroy {
  uid: any;
  passiveUserEditForm!: FormGroup;
  userDetailsSubscriber!: Subscription;
  countrySubscriber!: Subscription;
  stateSubscriber!: Subscription;
  passiveMemberDetails!: any;
  image: any = "assets/images/header-user.png";
  arrYear: any;
  filteredOptions!: Array<CountryCodes>;
  code!: string;
  getState: any;
  imageChangedEvent: any;
  croppedImage: any;
  openCropImageModal: boolean= false;
  getFileName: any;
  imageSrc!: any;
  imageUrl: any;

  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder : FormBuilder,
    private validator: ValidatorService,
    private sharedService: SharedService,
     private fileUploadService: FileUploadService
  ){
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.uid = params.get('id');
      },
      error: err => {}
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.getUserDetails();
    this.getYear();
    this.getCountryCodes();
  }

  ngOnDestroy(): void {
    if(this.userDetailsSubscriber){
      this.userDetailsSubscriber.unsubscribe();
    }
    if(this.countrySubscriber){
      this.countrySubscriber.unsubscribe();
    }
    if(this.stateSubscriber){
      this.stateSubscriber.unsubscribe();
    }
  }

  initForm(){
    this.passiveUserEditForm = this.formBuilder.group({
      name: [''],
      email: [''],
      phone: [''],
      secondaryPhone: [''],
      aboutYourself: [''],
      gender: [''],
      firstAddressLine: [''],
      secondAddressLine: [''],
      yearOfBirth: [''],
      country: [''],
      state: [''],
      city: [''],
      zipcode: [''],
      hobbies: [],
      profession: []
    })
  }

  /**Using for get user details */
  getUserDetails(){
    const params = {
        getUserByIdId: this.uid
      
    }
    this.loaderService.show();
    this.userDetailsSubscriber = this.apolloClient.setModule('getUserByID').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.passiveMemberDetails = response.data;
        // console.log("passiveMemberDetails..........",this.passiveMemberDetails);
        
        this.patchUserData();
        this.changeState('');
      }
    });
  }

  patchUserData(){
    this.image = this.passiveMemberDetails.profileImage ? this.passiveMemberDetails.profileImage : 'assets/images/header-user.png';
    this.passiveUserEditForm.patchValue({
      name: this.passiveMemberDetails.name ? this.passiveMemberDetails.name : '',
      email: this.passiveMemberDetails.email ? this.passiveMemberDetails.email : '',
      phone: this.passiveMemberDetails.phone ? this.passiveMemberDetails.phoneCode + ' ' +this.passiveMemberDetails.phone : '',
      secondaryPhone: this.passiveMemberDetails.secondaryPhone ? this.passiveMemberDetails.secondaryPhone : '',
      gender: this.passiveMemberDetails.gender ? this.passiveMemberDetails.gender : '',
      firstAddressLine: this.passiveMemberDetails.firstAddressLine ? this.passiveMemberDetails.firstAddressLine : '',
      secondAddressLine: this.passiveMemberDetails.secondAddressLine ? this.passiveMemberDetails.secondAddressLine : '',
      yearOfBirth: this.passiveMemberDetails.yearOfBirth ? this.passiveMemberDetails.yearOfBirth : '',
      country: this.passiveMemberDetails.countryCode ? this.passiveMemberDetails.countryCode : '',
      state: this.passiveMemberDetails.state ? this.passiveMemberDetails.state : '',
      city: this.passiveMemberDetails.city ? this.passiveMemberDetails.city : '',
      zipcode: this.passiveMemberDetails.zipcode ? this.passiveMemberDetails.zipcode : '',
      hobbies: this.passiveMemberDetails.hobbies ? this.passiveMemberDetails.hobbies.toString().trim() : [],
      profession: this.passiveMemberDetails.profession ? this.passiveMemberDetails.profession.toString().trim() : [],
      aboutYourself: this.passiveMemberDetails.aboutYourself ? this.passiveMemberDetails.aboutYourself : '',
    });
  }

  /**get year for year of birth */
  getYear(){
    const currentYear = (new Date()).getFullYear();
    const range = (start:any, stop:any, step:any) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    //console.log("year..........",range(currentYear, currentYear - 50, -1));
    this.arrYear = range(currentYear, currentYear - 123, -1);
  }

   /**Using for get the country codes */
   getCountryCodes() {
    this.loaderService.show();
    this.countrySubscriber = this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.filteredOptions = response.data;
      }
    });
  }

  /**Using for state change in depends on country */
  changeState(event:any){
    if(!event){
      this.code = this.passiveMemberDetails?.countryCode;
    }
    else{
      this.code = event.target.value;
    }
    const params= {
      data:{
        countryCode: this.code
      }
    }
    this.loaderService.show();
    this.stateSubscriber = this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getState = response.data;
        if(event){
          this.passiveUserEditForm.controls['firstAddressLine'].setValue('');
          this.passiveUserEditForm.controls['secondAddressLine'].setValue('');
          this.passiveUserEditForm.controls['state'].setValue('');
          this.passiveUserEditForm.controls['city'].setValue('');
          this.passiveUserEditForm.controls['zipcode'].setValue('');
        }
      }
    });
    this.loaderService.hide();
  }

   /**Using for text convert in capital letter */
   onlyCapsValue(event:any){
    let value = event.target.value;
      value.toUpperCase();
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

  /**Uploaded image preview */
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
    //this.uploadFileToS3Bucket(this.imageChangedEvent);
  }

  //Image Croped...............
  cropImg(event: ImageCroppedEvent) {
    //console.log("event.......",event);
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
  imgLoad() {
    // display cropper tool
  }
  initCropper() {
    // cropper ready
  }
  imgFailed() {
    // show message
  }

  /**Image upload in s3 bucket */
  uploadFileToS3Bucket(fileName: any) {
    if (fileName) {
      const bucket = new S3(
        {
          accessKeyId: environment.AWS_ACCESS_KEY,
          secretAccessKey: environment.AWS_SECRET_KEY,
          region: environment.AWS_REGION
          // region: 'ap-south-1'
        }
      );
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
          this.image = data.Location;
          return true;
        }
      });
    }else {
      this.alertService.error("No file uploaded.");
    }
  }

  /**Using for save uploaded image */
  saveImage(){
      this.openCropImageModal = false;
      // this.uploadFileToS3Bucket(this.croppedImage);
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.image = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'passive-member-profile-image');
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

  /**Using for close image modal */
  closeImage(){
    this.openCropImageModal = false;
  }

  /** Using for save passive member details*/
  saveData(){
    const INCAregex = /^\s*([A-Za-z0-9]{6})?$/;
    const UKregex = /^\s*([A-Za-z0-9]{5,7})?$/;
    const USregex = /^\s*([0-9]{5,6})?$/;
    const CAregex = /^[A-Z]\d[A-Z]\d[A-Z]\d?$/;
    const UKreg = /^(?=.*[A-Za-z])(?=.*\d).+$/;

    if(this.passiveMemberDetails.profileImage === null || this.passiveMemberDetails.profileImage === ""){
      if(this.image === null || this.image === "" || this.image === 'assets/images/header-user.png'){
        this.alertService.error("Please Upload the profile image");
        return;
      }
    }
    
    if(this.passiveUserEditForm.value?.name === "" || this.passiveUserEditForm.value?.name === null || this.passiveUserEditForm.value?.name === undefined){
      this.alertService.error("Name is required");
      return;
    }

    if(this.passiveUserEditForm.value?.yearOfBirth === "" || this.passiveUserEditForm.value?.yearOfBirth === null || this.passiveUserEditForm.value?.yearOfBirth === undefined){
      this.alertService.error("Year of birth is required");
      return;
    }

    if(this.passiveUserEditForm.value?.gender === "" || this.passiveUserEditForm.value?.gender === null || this.passiveUserEditForm.value?.gender === undefined){
      this.alertService.error("Gender is required");
      return;
    }

    if(this.passiveUserEditForm.value?.aboutYourself === "" || this.passiveUserEditForm.value?.aboutYourself === null || this.passiveUserEditForm.value?.aboutYourself === undefined){
      this.alertService.error("Please write about yourself");
      return;
    }

    if(this.passiveUserEditForm.value?.firstAddressLine === "" || this.passiveUserEditForm.value?.firstAddressLine === null || this.passiveUserEditForm.value?.firstAddressLine === undefined){
      this.alertService.error("Please enter your first address line");
      return;
    }

    if(this.passiveUserEditForm.value?.country === "" || this.passiveUserEditForm.value?.country === null || this.passiveUserEditForm.value?.country === undefined){
      this.alertService.error("Country is required");
      return;
    }

    if(this.passiveUserEditForm.value?.state === "" || this.passiveUserEditForm.value?.state === null || this.passiveUserEditForm.value?.state === undefined){
      this.alertService.error("State is required");
      return;
    }

    if(this.passiveUserEditForm.value?.city === "" || this.passiveUserEditForm.value?.city === null || this.passiveUserEditForm.value?.city === undefined){
      this.alertService.error("City is required");
      return;
    }

    if(this.passiveUserEditForm.value?.city === "" || this.passiveUserEditForm.value?.city === null || this.passiveUserEditForm.value?.city === undefined){
      this.alertService.error("City is required");
      return;
    }

    if(this.passiveUserEditForm.value?.zipcode === "" || this.passiveUserEditForm.value?.zipcode === null || this.passiveUserEditForm.value?.zipcode === undefined){
      this.alertService.error("Zipcode is required");
      return;
    }

    if(this.passiveUserEditForm.value.country.length!=0){
      if(this.code === 'IN'){
        if(!this.passiveUserEditForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
      }
      if(this.code === 'CA'){
        if(!this.passiveUserEditForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
        if(!this.passiveUserEditForm.value.zipcode.match(CAregex)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.code === 'GB'){
        if(!this.passiveUserEditForm.value.zipcode.match(UKregex)){
          this.alertService.error("Zip code should be between 5 to 7 characters");
          return;
        }
        if(!this.passiveUserEditForm.value.zipcode.match(UKreg)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.code === 'US'){
        if(!this.passiveUserEditForm.value.zipcode.match(USregex)){
          this.alertService.error("Zip code should be between 5 to 6 characters");
          return;
        }
      }
    }

    const params: any = {}
    params['data']={
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      id: this.uid,
      profileImage: this.image,
      name: this.passiveUserEditForm.value.name,
      email:"",
      secondaryCountryCode: this.passiveMemberDetails.countryCode,
      secondaryPhoneCode: this.passiveMemberDetails.phoneCode,
      secondaryPhone: this.passiveUserEditForm.value.secondaryPhone,
      yearOfBirth: this.passiveUserEditForm.value.yearOfBirth,
      gender: this.passiveUserEditForm.value.gender,
      hobbies: this.passiveUserEditForm.value.hobbies ? this.passiveUserEditForm.value.hobbies.split(',') : [],
      profession: this.passiveUserEditForm.value.profession ? this.passiveUserEditForm.value.profession.split(',') : [],
      aboutYourself: this.passiveUserEditForm.value.aboutYourself,
      firstAddressLine: this.passiveUserEditForm.value.firstAddressLine,
      secondAddressLine: this.passiveUserEditForm.value.secondAddressLine ? this.passiveUserEditForm.value.secondAddressLine : '',
      country: this.passiveUserEditForm.value.country,
      state: this.passiveUserEditForm.value.state,
      city: this.passiveUserEditForm.value.city,
      zipcode: this.passiveUserEditForm.value.zipcode,
    }
    // console.log("params......",params);
    this.loaderService.show();
      this.apolloClient.setModule("updateUser").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message)
        }
        else {
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('/active-members/track');
        }
      });
  }
}

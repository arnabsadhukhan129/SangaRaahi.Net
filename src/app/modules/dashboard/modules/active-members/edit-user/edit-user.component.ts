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
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit,OnDestroy {
  arrYear: any;
  filteredOptions!: Array<CountryCodes>;
  countrySubscriber!: Subscription;
  stateSubscriber!: Subscription;
  userDetailsSubscriber!: Subscription;
  activeMemberDetails!: any;
  code!: string;
  getState: any;
  userEditForm!: FormGroup;
  image: any = "assets/images/header-user.png";
  imageChangedEvent: any;
  croppedImage: any;
  openCropImageModal: boolean= false;
  getFileName: any;
  imageSrc!: any;
  uid: any;
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
    this.userEditForm = this.formBuilder.group({
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
      data:{
        id: this.uid
      }
    }
    this.loaderService.show();
    this.userDetailsSubscriber = this.apolloClient.setModule('communityActivePassiveMemberDetails').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.activeMemberDetails = response.data.user;
        console.log(this.activeMemberDetails);
        
        this.patchUserData();
        this.changeState('');
      }
    });
  }

  patchUserData(){
    this.image = this.activeMemberDetails.profileImage ? this.activeMemberDetails.profileImage : 'assets/images/header-user.png';
    this.userEditForm.patchValue({
      name: this.activeMemberDetails.name ? this.activeMemberDetails.name : '',
      email: this.activeMemberDetails.email ? this.activeMemberDetails.email : '',
      phone: this.activeMemberDetails.phone ? this.activeMemberDetails.phoneCode + ' ' +this.activeMemberDetails.phone : '',
      // secondaryPhone: this.activeMemberDetails.secondaryPhone ? this.activeMemberDetails.secondaryPhoneCode + ' ' +this.activeMemberDetails.secondaryPhone : '',
      secondaryPhone: this.activeMemberDetails.secondaryPhone ? this.activeMemberDetails.secondaryPhone : '',
      gender: this.activeMemberDetails.gender ? this.activeMemberDetails.gender : '',
      firstAddressLine: this.activeMemberDetails.firstAddressLine ? this.activeMemberDetails.firstAddressLine : '',
      secondAddressLine: this.activeMemberDetails.secondAddressLine ? this.activeMemberDetails.secondAddressLine : '',
      yearOfBirth: this.activeMemberDetails.yearOfBirth ? this.activeMemberDetails.yearOfBirth : '',
      country: this.activeMemberDetails.countryCode ? this.activeMemberDetails.countryCode : '',
      state: this.activeMemberDetails.state ? this.activeMemberDetails.state : '',
      city: this.activeMemberDetails.city ? this.activeMemberDetails.city : '',
      zipcode: this.activeMemberDetails.zipcode ? this.activeMemberDetails.zipcode : '',
      hobbies: this.activeMemberDetails.hobbies ? this.activeMemberDetails.hobbies.toString().trim() : [],
      profession: this.activeMemberDetails.profession ? this.activeMemberDetails.profession.toString().trim() : [],
      aboutYourself: this.activeMemberDetails.aboutYourself ? this.activeMemberDetails.aboutYourself : '',
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
      this.code = this.activeMemberDetails?.countryCode;
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
          this.userEditForm.controls['firstAddressLine'].setValue('');
          this.userEditForm.controls['secondAddressLine'].setValue('');
          this.userEditForm.controls['state'].setValue('');
          this.userEditForm.controls['city'].setValue('');
          this.userEditForm.controls['zipcode'].setValue('');
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

  saveData(){
    const INCAregex = /^\s*([A-Za-z0-9]{6})?$/;
    const UKregex = /^\s*([A-Za-z0-9]{5,7})?$/;
    const USregex = /^\s*([0-9]{5,6})?$/;
    const CAregex = /^[A-Z]\d[A-Z]\d[A-Z]\d?$/;
    const UKreg = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    console.log("image======",this.image);

    if(this.activeMemberDetails.profileImage === null || this.activeMemberDetails.profileImage === ""){
      if(this.image === null || this.image === "" || this.image === 'assets/images/header-user.png'){
        this.alertService.error("Please Upload the profile image");
        return;
      }
    }
    
    if(this.userEditForm.value?.name === "" || this.userEditForm.value?.name === null || this.userEditForm.value?.name === undefined){
      this.alertService.error("Name is required");
      return;
    }

    if(this.userEditForm.value?.yearOfBirth === "" || this.userEditForm.value?.yearOfBirth === null || this.userEditForm.value?.yearOfBirth === undefined){
      this.alertService.error("Year of birth is required");
      return;
    }

    if(this.userEditForm.value?.gender === "" || this.userEditForm.value?.gender === null || this.userEditForm.value?.gender === undefined){
      this.alertService.error("Gender is required");
      return;
    }

    // if(this.userEditForm.value?.hobbies === "" || this.userEditForm.value?.hobbies === null || this.userEditForm.value?.hobbies === undefined){
    //   this.alertService.error("Hobbies is required");
    //   return;
    // }

    // if(this.userEditForm.value?.profession === "" || this.userEditForm.value?.profession === null || this.userEditForm.value?.profession === undefined){
    //   this.alertService.error("Profession is required");
    //   return;
    // }

    if(this.userEditForm.value?.aboutYourself === "" || this.userEditForm.value?.aboutYourself === null || this.userEditForm.value?.aboutYourself === undefined){
      this.alertService.error("Please write about yourself");
      return;
    }

    if(this.userEditForm.value?.firstAddressLine === "" || this.userEditForm.value?.firstAddressLine === null || this.userEditForm.value?.firstAddressLine === undefined){
      this.alertService.error("Please enter your first address line");
      return;
    }

    if(this.userEditForm.value?.country === "" || this.userEditForm.value?.country === null || this.userEditForm.value?.country === undefined){
      this.alertService.error("Country is required");
      return;
    }

    if(this.userEditForm.value?.state === "" || this.userEditForm.value?.state === null || this.userEditForm.value?.state === undefined){
      this.alertService.error("State is required");
      return;
    }

    if(this.userEditForm.value?.city === "" || this.userEditForm.value?.city === null || this.userEditForm.value?.city === undefined){
      this.alertService.error("City is required");
      return;
    }

    if(this.userEditForm.value?.city === "" || this.userEditForm.value?.city === null || this.userEditForm.value?.city === undefined){
      this.alertService.error("City is required");
      return;
    }

    if(this.userEditForm.value?.zipcode === "" || this.userEditForm.value?.zipcode === null || this.userEditForm.value?.zipcode === undefined){
      this.alertService.error("Zipcode is required");
      return;
    }

    if(this.userEditForm.value.country.length!=0){
      if(this.code === 'IN'){
        if(!this.userEditForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
      }
      if(this.code === 'CA'){
        if(!this.userEditForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
        if(!this.userEditForm.value.zipcode.match(CAregex)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.code === 'GB'){
        if(!this.userEditForm.value.zipcode.match(UKregex)){
          this.alertService.error("Zip code should be between 5 to 7 characters");
          return;
        }
        if(!this.userEditForm.value.zipcode.match(UKreg)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.code === 'US'){
        if(!this.userEditForm.value.zipcode.match(USregex)){
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
      name: this.userEditForm.value.name,
      email:"",
      secondaryCountryCode: this.activeMemberDetails.countryCode,
      secondaryPhoneCode: this.activeMemberDetails.phoneCode,
      secondaryPhone: this.userEditForm.value.secondaryPhone,
      yearOfBirth: this.userEditForm.value.yearOfBirth,
      gender: this.userEditForm.value.gender,
      hobbies: this.userEditForm.value.hobbies ? this.userEditForm.value.hobbies.split(',') : [],
      profession: this.userEditForm.value.profession ? this.userEditForm.value.profession.split(',') : [],
      aboutYourself: this.userEditForm.value.aboutYourself,
      firstAddressLine: this.userEditForm.value.firstAddressLine,
      secondAddressLine: this.userEditForm.value.secondAddressLine ? this.userEditForm.value.secondAddressLine : '',
      country: this.userEditForm.value.country,
      state: this.userEditForm.value.state,
      city: this.userEditForm.value.city,
      zipcode: this.userEditForm.value.zipcode,
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
          this.router.navigateByUrl('/active-members');
        }
      });
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
          // region: 'ap-south-1'  //Asia Pacific (Mumbai)
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

  /**Using for save uploaded image */
  saveImage(){
      this.openCropImageModal = false;
      // this.uploadFileToS3Bucket(this.croppedImage);
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.image = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'user-profile-image');
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
}

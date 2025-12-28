import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit, OnDestroy {
  userId!: string;
  userDetailsSubscriber!: Subscription;
  countrySubscriber!: Subscription;
  stateSubscriber!: Subscription;
  activeMemberDetails!: any;
  userForm!: FormGroup;
  arrYear: any;
  filteredOptions!: Array<CountryCodes>;
  code!: string;
  getState: any;
  profileImage: string = '';
  croppedImage: any; 
  openCropImageModal: boolean= false;
  getFileName: any;
  imageChangedEvent: any;
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
    this.userId = this.storageService.getLocalStorageItem('userId');
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
    this.userForm = this.formBuilder.group({
      name: ['',[Validators.required, this.validator.isEmpty]],
      email: ['',[Validators.required, this.validator.isEmpty]],
      phone: ['',[Validators.required, this.validator.isEmpty]],
      secondaryPhone: [''],
      aboutYourself: [''],
      gender: ['',[Validators.required, this.validator.isEmpty]],
      firstAddressLine: ['',[Validators.required, this.validator.isEmpty]],
      secondAddressLine: [''],
      yearOfBirth: ['',[Validators.required, this.validator.isEmpty]],
      country: ['',[Validators.required, this.validator.isEmpty]],
      state: ['',[Validators.required, this.validator.isEmpty]],
      city: ['',[Validators.required, this.validator.isEmpty]],
      zipcode: ['',[Validators.required, this.validator.isEmpty]],
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
        // console.log(this.activeMemberDetails);
        
        this.patchUserData();
        this.changeState('');
      }
    });
  }

  patchUserData(){
    this.profileImage = this.activeMemberDetails.profileImage ? this.activeMemberDetails.profileImage : '';
    this.userForm.patchValue({
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
          this.userForm.controls['firstAddressLine'].setValue('');
          this.userForm.controls['secondAddressLine'].setValue('');
          this.userForm.controls['state'].setValue('');
          this.userForm.controls['city'].setValue('');
          this.userForm.controls['zipcode'].setValue('');
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

  //Remove the upload image.....
  deleteImage(){
    this.profileImage = '';
  }

  //Image Croped...............
   cropImg(event: ImageCroppedEvent) {
    //console.log("event.......",event);
    this.croppedImage = event.blob;
  }   

  closeImage(){
    this.openCropImageModal = false;
  }


 saveImage(){
    this.openCropImageModal = false;

    if (this.croppedImage) {
      const formData = new FormData();
      formData.append('type', 'profile-image');
      formData.append('images', this.croppedImage);
      this.fileUploadService.sendFile(formData).subscribe({
        next: (res) => {
          this.profileImage = res.urls[0];
          this.alertService.error("Image has been uploaded successfully");
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.alertService.error("There was an error uploading your file");
        }
      });
    }
  }
  

  setS3BucketUploadedFilePath (err : any, data : any) {
    
    if (err) {
            this.alertService.error("There was an error uploading your file");
            return false;
    } else {
            this.profileImage = data.Location;         
            this.alertService.error("Image has been uploaded successfully");
            return true;
    }
  }

  uploadImage(event: any, imageName: String) {
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.openCropImageModal = true;
    this.imageChangedEvent = event;

    if (event.target.files && event.target.files[0]) {
      let size = event.target.files[0].size / 1024;
      //console.log('image size----', size);
      if (size > 5120) { //size < 2048
        this.alertService.error("Image size should be within 2-5MB.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        let imageSrc = event.target?.result;
        //console.log('imageSrc----', imageSrc);
      }
    }
  }

  /**Using for modified data save */
  saveData(){
    const INCAregex = /^\s*([A-Za-z0-9]{6})?$/;
    const UKregex = /^\s*([A-Za-z0-9]{5,7})?$/;
    const USregex = /^\s*([0-9]{5,6})?$/;
    const CAregex = /^[A-Z]\d[A-Z]\d[A-Z]\d?$/;
    const UKreg = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if(this.userForm.value.country.length!=0){
      if(this.userForm.value.countryCode === 'IN'){
        if(!this.userForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
      }
      if(this.userForm.value.countryCode === 'CA'){
        if(!this.userForm.value.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
        if(!this.userForm.value.zipcode.match(CAregex)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.userForm.value.countryCode === 'GB'){
        if(!this.userForm.value.zipcode.match(UKregex)){
          this.alertService.error("Zip code should be between 5 to 7 characters");
          return;
        }
        if(!this.userForm.value.zipcode.match(UKreg)){
          this.alertService.error("Zip code is invalid");
          return;
        }
      }
      if(this.userForm.value.countryCode === 'US'){
        if(!this.userForm.value.zipcode.match(USregex)){
          this.alertService.error("Zip code should be between 5 to 6 characters");
          return;
        }
      }
    }
    const params: any = {}
    params['data']={
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      name: this.userForm.value.name,
      // email: this.userForm.value.email,
      email:"",
      secondaryCountryCode: this.activeMemberDetails.countryCode,
      secondaryPhoneCode: this.activeMemberDetails.phoneCode,
      secondaryPhone: this.userForm.value.secondaryPhone,
      // phone:   this.userForm.value.phone,
      // phoneCode: this.activeMemberDetails.phoneCode,
      gender: this.userForm.value.gender,
      firstAddressLine: this.userForm.value.firstAddressLine,
      secondAddressLine: this.userForm.value.secondAddressLine,
      yearOfBirth: this.userForm.value.yearOfBirth,
      aboutYourself: this.userForm.value.aboutYourself,
      country: this.userForm.value.country,
      state: this.userForm.value.state,
      city: this.userForm.value.city,
      zipcode: this.userForm.value.zipcode,
      profileImage: this.profileImage,
      hobbies: this.userForm.value.hobbies ? this.userForm.value.hobbies.split(',') : [],
      profession: this.userForm.value.profession ? this.userForm.value.profession.split(',') : [],
    }
    // console.log("value====",this.userForm.value);
    this.loaderService.show();
      this.apolloClient.setModule("updateUser").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message)
        }
        else {
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('active-members/my-profile/'+this.uid);
          // this.router.navigateByUrl('profile/my-profile/'+this.uid);
        }
      });
  }

}

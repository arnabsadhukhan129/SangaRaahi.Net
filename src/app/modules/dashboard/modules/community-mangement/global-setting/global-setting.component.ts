import { Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { CommonService } from '../../../services/common.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
@Component({
  selector: 'app-global-setting',
  templateUrl: './global-setting.component.html',
  styleUrls: ['./global-setting.component.css']
})
export class GlobalSettingComponent implements OnInit, OnChanges, OnDestroy {
  smsReminderSubscriber!: Subscription;
  viewToggleSubscriber!: Subscription;
  webCheck: boolean = false;
  announcementCheckbox:boolean = false;
  videoCheckbox:boolean = false;
  paymentCheckbox:boolean = false;
  aboutUsCheckbox: boolean = false;
  headerSize!:number;
  bodySize!:number;
  color:any;
  bgColor:any;
  globalSettingForm!:FormGroup;
  image: any;
  imageSrc!: any;
  isAllcheck:boolean = false;
  istrueAll: boolean = false;
  changeText!:boolean;
  headerFont:any;
  bodyFont:any;
  communityDetails:any;
  value="#e66465";
  comName!: string;
  imageChangedEvent: any;
  croppedImage: any;
  openCropImageModal: boolean= false;
  getFileName: any;
  viewToggleDetails: any;
  viewToggleDetailsPrevious: any;
  imageUrl: any;

  constructor(
    private builder : FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private commonService : CommonService,
    private validator: ValidatorService,
    private fileUploadService: FileUploadService
  ){}
  ngOnInit(): void {
    this.initForm();
    this.getCommunitySettingsViewDetails();
    this.viewSmsEmailToggle();
    this.comName = this.storageService.getLocalStorageItem('communityName');
  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnDestroy(): void {
    if(this.smsReminderSubscriber){
      this.smsReminderSubscriber.unsubscribe();
    }
    if(this.viewToggleSubscriber){
      this.viewToggleSubscriber.unsubscribe();
    }
  }

  initForm(){
    this.globalSettingForm = this.builder.group({
      announcementPage: [''],
      videoPage: [''],
      paymentPage: [''],
      aboutPage: [''],
      lebel: ['',[Validators.required, this.validator.isEmpty, this.validator.noSpace, this.validator.labelIsLong, this.validator.noSlash, this.validator.isSameWord]],
      headerFont: [''],
      headerFontSize: [''],
      bodyFont: [''],
      bodyFontSize: [''],
      textColor: [''],
      backgroupColor: ['']
    })
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
      } else {
        this.communityDetails = response.data;

        if(this.communityDetails) {
          this.patchData(this.communityDetails);
        }

        this.image = this.communityDetails && this.communityDetails.watermark ? this.communityDetails.watermark : '';

        this.announcementCheckbox = this.communityDetails && this.communityDetails.announcementPage ? true : false;
        this.videoCheckbox = this.communityDetails && this.communityDetails.videoPage ? true : false;
        this.paymentCheckbox = this.communityDetails && this.communityDetails.paymentPage ? true : false;
        this.aboutUsCheckbox = this.communityDetails && this.communityDetails.aboutPage ? true : false;

      }
    });
  }

  patchData(communityDetails:any){
    this.globalSettingForm.patchValue({
      announcementPage: communityDetails.announcementPage ? communityDetails.announcementPage : '',
      videoPage: communityDetails.videoPage ? communityDetails.videoPage : '',
      paymentPage: communityDetails.paymentPage ? communityDetails.paymentPage : '',
      aboutPage: communityDetails.aboutPage ? communityDetails.aboutPage : '',
      lebel: communityDetails.lebel ? communityDetails.lebel : '',
      headerFont: communityDetails.headerFont ? communityDetails.headerFont : '',
      headerFontSize: communityDetails.headerFontSize ? communityDetails.headerFontSize : '',
      bodyFont: communityDetails.bodyFont ? communityDetails.bodyFont : '',
      bodyFontSize: communityDetails.bodyFontSize ? communityDetails.bodyFontSize : '',
      textColor: communityDetails.textColor ? communityDetails.textColor : '#FFB345',
      backgroupColor: communityDetails.backgroupColor ? communityDetails.backgroupColor : '#FFF2CC'
    });
  }

  checkAll(event:any){
    if(event.target.checked === true){
      this.announcementCheckbox = true;
      this.videoCheckbox = true;
      this.paymentCheckbox = true;
      this.aboutUsCheckbox = true;
      this.isAllcheck = true;
      this.istrueAll = true;
    }
    else{
      this.announcementCheckbox = false;
      this.videoCheckbox = false;
      this.paymentCheckbox = false;
      this.aboutUsCheckbox = false;
      this.isAllcheck = false;
      this.globalSettingForm.value.announcementPage= '';
      this.globalSettingForm.value.videoPage= '';
      this.globalSettingForm.value.paymentPage= '';
      this.globalSettingForm.value.aboutPage= '';
    }
  }
  chkAnnouncement(event:any){
    if(event.target.checked === true){
      this.announcementCheckbox = true;
      this.globalSettingForm.value.announcementPage= true;
      if( this.announcementCheckbox &&  this.videoCheckbox && this.paymentCheckbox && this.aboutUsCheckbox) {
        this.isAllcheck = true;
      }
    }
    else{
      this.isAllcheck = false;
      this.announcementCheckbox = false;
      this.globalSettingForm.value.announcementPage= false;
    }
  }
  chkVideo(event:any){
    if(event.target.checked === true){
      this.videoCheckbox = true;
      this.globalSettingForm.value.videoPage= true;
      if( this.announcementCheckbox &&  this.videoCheckbox && this.paymentCheckbox && this.aboutUsCheckbox) {
        this.isAllcheck = true;
      }
    }
    else{
      this.isAllcheck = false;
      this.videoCheckbox = false;
      this.globalSettingForm.value.videoPage= false;
    }
  }
  chkPayment(event:any){
    if(event.target.checked === true){
      this.paymentCheckbox = true;
      this.globalSettingForm.value.paymentPage= true;
      if( this.announcementCheckbox &&  this.videoCheckbox && this.paymentCheckbox && this.aboutUsCheckbox) {
        this.isAllcheck = true;
      }
    }
    else{
      this.paymentCheckbox = false;
      this.isAllcheck = false;
      this.globalSettingForm.value.paymentPage= false;
    }
  }
  chkAbout(event:any){
    if(event.target.checked === true){
      this.aboutUsCheckbox = true;
      this.globalSettingForm.value.aboutPage= true;
      if( this.announcementCheckbox &&  this.videoCheckbox && this.paymentCheckbox && this.aboutUsCheckbox) {
        this.isAllcheck = true;
      }
    }
    else{
      this.aboutUsCheckbox = false;
      this.isAllcheck = false;
      this.globalSettingForm.value.aboutPage= false;
    }
  }

  previewImage(event:any){
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.openCropImageModal = true;
    this.imageChangedEvent = event;
    const fileSize = event.target.files[0]?.size / 1024 ** 2;
    if(fileSize<=2){
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]); // read file as data url
        reader.onload = (event) => { // called once readAsDataURL is completed
          this.imageSrc = event.target?.result;
        }
    }
    //this.uploadFileToS3Bucket(event);
   }
    else{
      this.alertService.error("File size must be maximum between 2mb");
      return;
    }
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

  saveImage(){
    this.openCropImageModal = false;
    // this.uploadFileToS3Bucket(this.croppedImage);
    if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
    this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
      this.image = base64; // only for preview
      const formData = new FormData();
      formData.append('type', 'webpage-watermark');
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

  closeImage(){
    this.openCropImageModal = false;
  }

  uploadFileToS3Bucket(fileName: any) {
    // const file = fileName.target.files[0] ? fileName.target.files[0] : '';
    // const files = fileName.target.files ? fileName.target.files : '';
    if (fileName) {
      this.loaderService.show();
      const bucket = new S3(
        {
          accessKeyId: environment.AWS_ACCESS_KEY,
          secretAccessKey: environment.AWS_SECRET_KEY,
          region: environment.AWS_REGION
          // region: 'ap-south-1'  //Asia Pacific (Mumbai)
        }
      );

      // upload file to the bucket...........
      const params = {
            Bucket: environment.BUCKET_NAME,
            Key: this.getFileName,
            Body: fileName,
            ACL: 'public-read'
        };
      bucket.upload(params,  (err: any, data: any) => {
        if (err) {
          this.loaderService.hide();
          this.alertService.error("There was an error uploading your file");
          return false;
        }
        else {
          //this.alertService.error("Successfully uploaded file.");
          this.image = data.Location;
          this.loaderService.hide();
          return true;
        }
      });
    }else {
      this.loaderService.hide();
      this.alertService.error("No file uploaded.");
    }
  }

  saveDetails(){
    if(this.isAllcheck){
      this.globalSettingForm.value.announcementPage= true;
      this.globalSettingForm.value.videoPage= true;
      this.globalSettingForm.value.paymentPage= true;
      this.globalSettingForm.value.aboutPage= true;
    }
    const params:any={};
    params['data'] = {
      announcementPage: this.globalSettingForm.value.announcementPage ? this.globalSettingForm.value.announcementPage : false,
      videoPage: this.globalSettingForm.value.videoPage ? this.globalSettingForm.value.videoPage : false,
      paymentPage: this.globalSettingForm.value.paymentPage ? this.globalSettingForm.value.paymentPage : false,
      aboutPage: this.globalSettingForm.value.aboutPage ? this.globalSettingForm.value.aboutPage : false,
      lebel: this.globalSettingForm.value.lebel ? this.globalSettingForm.value.lebel.toLowerCase() : '',
      watermark: this.image,
      headerFont: this.globalSettingForm.value.headerFont ? this.globalSettingForm.value.headerFont : 'Poppins',
      headerFontSize: this.globalSettingForm.value.headerFontSize ? parseInt(this.globalSettingForm.value.headerFontSize) : 24,
      bodyFont: this.globalSettingForm.value.bodyFont ? this.globalSettingForm.value.bodyFont : 'Poppins',
      bodyFontSize: this.globalSettingForm.value.bodyFontSize ? parseInt(this.globalSettingForm.value.bodyFontSize) : 18,
      textColor: this.globalSettingForm.value.textColor ? this.globalSettingForm.value.textColor : '',
      backgroupColor: this.globalSettingForm.value.backgroupColor ? this.globalSettingForm.value.backgroupColor : ''
    }

    this.loaderService.show();
    this.apolloClient.setModule("addOrgGlobalSettings").mutateData(params).subscribe((response:any) => {
      if(response.error){
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
       else{
        this.loaderService.hide();
        this.alertService.error(response.message);
        this.router.navigateByUrl("community-management/profile-edit");
       }
    });
  }

  cancel(){
    this.router.navigateByUrl("community-management/profile-edit");
  }

  deleteImage(){
    this.image = '';
  }

  previousPage(){
    this.patchData(this.communityDetails);
    this.image = this.communityDetails.watermark ? this.communityDetails.watermark : '';
    this.announcementCheckbox = this.communityDetails && this.communityDetails.announcementPage ? true : false;
    this.videoCheckbox = this.communityDetails && this.communityDetails.videoPage ? true : false;
    this.paymentCheckbox = this.communityDetails && this.communityDetails.paymentPage ? true : false;
    this.aboutUsCheckbox = this.communityDetails && this.communityDetails.aboutPage ? true : false;
  }

  back(){
    this.router.navigateByUrl('community-management/profile-edit');
  }


  /**Sms reminder on or off */
  toggleSmsReminder(event:any){
    const params:any={};
    if(event.target.checked){
     params['data']={
      communityId : this.storageService.getLocalStorageItem('communtityId'),
      sms: true
     }
      
    }else{
      params['data']={
        communityId : this.storageService.getLocalStorageItem('communtityId'),
        sms: false
       }
    }
    this.loaderService.show();
      this.smsReminderSubscriber = this.apolloClient.setModule('updateSmsEmailGlobalSettings').mutateData(params).subscribe({
        next:(response: GeneralResponse)=>{
          this.loaderService.hide();
          if(response.error){
            this.alertService.error(response.message);
          }
          else{
            this.alertService.error(response.message);
          }
        },
        error: err =>{
          console.log(err);     
          this.loaderService.hide();   
        }
      });
  }

  /**Email reminder on or off */
  toggleEmailReminder(event:any){
    const params:any={};
    if(event.target.checked){
     params['data']={
      communityId : this.storageService.getLocalStorageItem('communtityId'),
      email: true
     }
      
    }else{
      params['data']={
        communityId : this.storageService.getLocalStorageItem('communtityId'),
        email: false
       }
    }
    this.loaderService.show();
      this.smsReminderSubscriber = this.apolloClient.setModule('updateSmsEmailGlobalSettings').mutateData(params).subscribe({
        next:(response: GeneralResponse)=>{
          this.loaderService.hide();
          if(response.error){
            this.alertService.error(response.message);
          }
          else{
            this.alertService.error(response.message);
          }
        },
        error: err =>{
          console.log(err);     
          this.loaderService.hide();   
        }
      });
  }

  /**View Sms Email Reminder */
  viewSmsEmailToggle(){
    const params:any = {};
    params['data'] = {
      communityId: this.storageService.getLocalStorageItem('communtityId'),
    }
    this.loaderService.show();
      this.viewToggleSubscriber = this.apolloClient.setModule('viewSmsEmailGlobalSettings').queryData(params).subscribe({
        next: (response: GeneralResponse)=> {
          if(response.error) {
            this.alertService.error(response.message);
            return;
          }
          else{
            this.viewToggleDetails = response.data;  
          }
        }
      })
    }
  }

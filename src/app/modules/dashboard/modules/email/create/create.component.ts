import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { param } from 'jquery';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { Event } from 'src/app/shared/models/events.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit,OnDestroy {
  eventSubscriber!: Subscription;
  mailTemplateSubscriber!: Subscription;
  templateIdSubscriber!: Subscription;
  stateSubscriber!: Subscription;
  evetList: Event[] = [];
  mailTemplateForm!: FormGroup;
  croppedImage: any;
  openCropImageModal: boolean= false;
  templateImage: string = '';
  getFileName: any;
  imageChangedEvent: any;
  templateId: any;
  getEmailDetails: any;
  eventDetails : any;
  countryName!: string;
  getState:any;
  stateName!: string;
  statusVal!: string;
  setDescription: any;
  imageUrl: any;

  constructor(
    private formBuilder : FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private validator: ValidatorService,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer,
    private fileUploadService: FileUploadService
  ){
    this.templateIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.templateId = params.get('id');
      },
      error: err => {}
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getPublicEvent();
    if(this.templateId){
      this.getTemplateDetails();
    }
  }
  ngOnDestroy(): void {
    if(this.templateIdSubscriber){
      this.templateIdSubscriber.unsubscribe();
    }
    if(this.eventSubscriber){
      this.eventSubscriber.unsubscribe();
    }
    if(this.mailTemplateSubscriber){
      this.mailTemplateSubscriber.unsubscribe();
    }
    if(this.stateSubscriber){
      this.stateSubscriber.unsubscribe();
    }
  }

  /**Using for  intialize blog form */
  initForm(){
    this.mailTemplateForm = this.formBuilder.group({
      eventId: new FormControl('',[Validators.required, this.validator.isEmpty]),
      mailTemplateName: new FormControl('',[Validators.required, this.validator.isEmpty]),
      mailHeader: new FormControl('',[Validators.required, this.validator.isEmpty]),
      mailTitle: new FormControl('',[Validators.required, this.validator.isEmpty]),
      description: new FormControl('',[Validators.required, this.validator.isEmpty]),
      eventLink: new FormControl(''),
    })
  }

  /**Using for get email template details */
  getTemplateDetails(){
    const params:any = {};
    params['data'] = {
      mailtemplateId: this.templateId
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMailTemplateById').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      }
      else{
        this.getEmailDetails =  response?.data?.mailtemplatesId;
        this.mailTemplateForm.patchValue({
          eventId: this.getEmailDetails.eventId ? this.getEmailDetails.eventId : '',
          mailTemplateName: this.getEmailDetails.mailTemplateName ? this.getEmailDetails.mailTemplateName : '',
          mailHeader: this.getEmailDetails.mailHeader ? this.getEmailDetails.mailHeader : '',
          mailTitle: this.getEmailDetails.mailTitle ? this.getEmailDetails.mailTitle : '',
          description: this.getEmailDetails.description ? this.getEmailDetails.description : '',
          eventLink: this.getEmailDetails.eventLink ? this.getEmailDetails.eventLink : '',
        });
        this.templateImage = this.getEmailDetails.bannerImage ? this.getEmailDetails.bannerImage : '';
      }
      // console.log(this.getEmailDetails.eventId);

      this.getEventByID(this.getEmailDetails.eventId);
    });
    this.loaderService.hide();
  }

  //For event list............
  getPublicEvent(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params:any = {};
    params['data'] = {
      communityId: community_id,
    }
    this.loaderService.show();
    this.eventSubscriber = this.apolloClient.setModule('getMyCommunityEventsList').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      }
      else{
          this.evetList =  response.data.events;
      }
    })
    this.loaderService.hide();
  }

  uploadImage(event: any, imageName: String) {
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.openCropImageModal = true;
    this.imageChangedEvent = event;

    if (event.target.files && event.target.files[0]) {
      let size = event.target.files[0].size / 1024;
      if (size > 5120) { //size < 2048
        this.alertService.error("Image size should be within 2-5MB.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        let imageSrc = event.target?.result;
      }
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

  closeImage(){
    this.openCropImageModal = false;
  }

  deleteImage(){
    this.templateImage = '';
  }

  saveImage(){
      this.openCropImageModal = false;
      // this.sharedService.uploadCropedFileToS3Bucket(this.croppedImage, this.getFileName, 'groupImage',
      //   (err : any, data : any, imageType: string) => {
      //     this.setS3BucketUploadedFilePath(err, data);
      //   });
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.templateImage = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'template-image');
        formData.append('images', this.imageUrl); // this.imageUrl is File
        this.fileUploadService.sendFile(formData).subscribe({
          next: (res) => {
            // console.log('Upload success:', res);
            this.templateImage = res.urls[0]
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

  setS3BucketUploadedFilePath (err : any, data : any) {
    if (err) {
            this.alertService.error("There was an error uploading your file");
            return false;
    } else {
            this.templateImage = data.Location;
            this.alertService.error("Image has been uploaded successfully");
          return true;
    }
  }

  /**Using for save data....... */
  saveData(getValue: any){
    const URLregex = /^(https?:\/\/)/;
    if(this.mailTemplateForm.value.eventLink != ''){
      if(!this.mailTemplateForm.value.eventLink.match(URLregex)){
        this.alertService.error("Invalid event details link");
        return;
      }
    }
    if(this.templateImage === '' || this.templateImage === null || this.templateImage === undefined){
      this.alertService.error("Image is required");
      return;
    }
    const params: any = {};
    if(getValue === 1){
      // this.statusVal = "Draft",
      // this.setDescription = this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : ''
      params['data'] = {
        mailTemplateName: this.mailTemplateForm.value.mailTemplateName ? this.mailTemplateForm.value.mailTemplateName : '',
        bannerImage: this.templateImage ? this.templateImage : '',
        mailHeader: this.mailTemplateForm.value.mailHeader ? this.mailTemplateForm.value.mailHeader : '',
        mailTitle: this.mailTemplateForm.value.mailTitle ? this.mailTemplateForm.value.mailTitle : '',
        // description: this.setDescription,
        description: this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : '',
        eventLink: this.mailTemplateForm.value.eventLink ? this.mailTemplateForm.value.eventLink : '',
        status: "Draft"
      }
    }
    else if(getValue === 2){
      // this.statusVal = "Publish",
      this.setDescription = this.getHtML()
      params['data'] = {
        mailTemplateName: this.mailTemplateForm.value.mailTemplateName ? this.mailTemplateForm.value.mailTemplateName : '',//null,//this.mailTemplateForm.value.mailTemplateName ? this.mailTemplateForm.value.mailTemplateName : '',
        bannerImage: this.templateImage ? this.templateImage : '',
        mailHeader: this.mailTemplateForm.value.mailHeader ? this.mailTemplateForm.value.mailHeader : '',
        mailTitle: null,//this.mailTemplateForm.value.mailTitle ? this.mailTemplateForm.value.mailTitle : '',
        description: this.setDescription,
        // description: this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : '',
        eventLink: null,//this.mailTemplateForm.value.eventLink ? this.mailTemplateForm.value.eventLink : '',
        status: "Publish"
      }
    }
    // const params: any = {};
    // console.log("params=====",params); return;

    this.loaderService.show();
    if(this.templateId){
      params['data'].mailtemplateId = this.templateId;
      this.mailTemplateSubscriber = this.apolloClient.setModule("updateMailTemplates").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message)
        }
        else {
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('email-template/template-list');
        }
      });
    }
    else{
      params['data'].communityId= this.storageService.getLocalStorageItem('communtityId'),
      params['data'].eventId= this.mailTemplateForm.value.eventId ? this.mailTemplateForm.value.eventId : '',
      this.mailTemplateSubscriber = this.apolloClient.setModule("createMailTemplates").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message)
        }
        else {
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('email-template/template-list');
        }
      });
    }
  }

  getHtML(){
    // return `<!doctype html> <html lang="en"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, shrink-to-fit=no"> <title>Sangaraahi Mail Temp</title> <style> @page { margin: 0px 0px; padding: 0px 0px; border: 0px none !important; } body { margin: 0px 0px; padding: 0px 0px; } p { text-align:center; } .store-icons{ justify-self: center; } .as-icon{ align-self: center; justify-self: center; } .mail_temp_table { /* background-color: #d7e8e0; */ background-color: #eadbeb; } </style> </head> <body style="padding:0; margin: 0; font-family: Arial; font-size: 14px; line-height: 20px;"> <table class="mail_temp_table" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin: 20px auto 20px; border-radius: 20px; background-color: #FCA62A;"> <tr> <td style=" background-image: url(${this.templateImage}); background-size: cover; background-position: center center; background-color: #fff; position: relative; text-align: center; padding: 0; height: 100px; border-radius: 20px 20px 0 0; " > <a href="#" target="_blank" style="position: absolute; left: 30px; bottom: -50px;"> <img src="${this.eventDetails.logoImage}" style="width: 100px; height: 100px; border: 2px solid #fff; border-radius: 100%; object-fit: contain; object-position: center center;"> </a> </td> </tr> <tr> <td style="height: 55px; "></td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>Mail Title :</b> &nbsp; ${this.mailTemplateForm.value.mailTitle ? this.mailTemplateForm.value.mailTitle : 'N/A'} </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: justify;" > <b>Event Message / Description :</b> &nbsp; <span style="text-align: justify;">${this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : 'N/A'} </span> </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px 5px; text-align: left; border-bottom: 1px solid #000;" > <b>Event Details</b> &nbsp; </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>Address Line1 :</b> &nbsp; ${this.eventDetails.venueDetails.firstAddressLine ? this.eventDetails.venueDetails.firstAddressLine : 'N/A'} </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>Address Line1 :</b> &nbsp; ${this.eventDetails.venueDetails.secondAddressLine ? this.eventDetails.venueDetails.secondAddressLine : 'N/A'} </td> </tr> <tr> <td> <table> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>Country :</b> &nbsp; ${this.countryName ? this.countryName : 'N/A'} </td> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>State :</b> &nbsp; ${this.stateName ? this.stateName : 'N/A'} </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>City :</b> &nbsp; ${this.eventDetails.venueDetails.city ? this.eventDetails.venueDetails.city : 'N/A'} </td> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>Zip Code :</b> &nbsp; ${this.eventDetails.venueDetails.zipcode ? this.eventDetails.venueDetails.zipcode : 'N/A'} </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>Contact Number :</b> &nbsp; ${this.eventDetails.venueDetails.phoneNo ? this.eventDetails.venueDetails.phoneCode + this.eventDetails.venueDetails.phoneNo : 'N/A'} </td> </tr> <tr> <td align="center" valign="top" style="font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;" > <b>URL Links :</b> &nbsp; ${this.mailTemplateForm.value.eventLink ? this.mailTemplateForm.value.eventLink : 'N/A'} </td> </tr> </table> </td> </tr> <tr> <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 5px 30px 5px; text-align: left; border-bottom: 1px solid #000;' > </td> </tr> <tr> <tr> <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 20px 10px 15px; text-align: center;' > <b>You can download the app on</b> </td> </tr> <tr> <td align="center" style="text-align: center; padding: 0px 0px 30px;"> <table style="width: 100%;"> <tr> <td style="align-items: right; text-align: right; padding: 20px 15px 20px;"> <a href="https://apps.apple.com/us/app/the-empathy-set/id1570154720" target="_blank" (click)="javascript:void(0)"> <img class="store-icon" style="height: 58px !important; " src="https://assets.stickpng.com/images/5a902db97f96951c82922874.png"> </a> </td> <td style="align-items: left; text-align: left; padding: 20px 15px 20px;"> <a href="https://play.google.com/store/apps/details?id=com.johnford.tes" target="_blank" (click)="javascript:void(0)"> <img class="store-icon" style="height: 58px !important; " src="https://images.squarespace-cdn.com/content/v1/59f7a1887131a53d15f4abf9/b04621bc-c95e-4dd4-a8f4-b097f67666bd/Get+it+on+Google+Play.png?format=750w"/> </a> </td> </tr> </table> </td> </tr> </table> </body> </html>`;

      return `<!doctypehtml><html lang=en><meta charset=utf-8><meta content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,shrink-to-fit=no"name=viewport><title>Sangaraahi Mail Temp</title><style>@page{margin:0 0;padding:0 0;border:0 none!important}body{margin:0 0;padding:0 0}</style><body style=padding:0;margin:0;font-family:Arial;font-size:14px;line-height:20px><table style="border-collapse:collapse;margin:20px auto 20px;border-radius:20px;background-color:#fca62a"border=0 cellpadding=0 cellspacing=0 class=mail_temp_table width=600><tr><td style="background-image:url(${this.templateImage});background-size:cover;background-position:center center;background-color:#fff;position:relative;padding:0;height:100px;border-radius:20px 20px 0 0;text-align:left;padding:20px"><a href=# target=_blank style=position:relative;display:inline-block><img src=${this.eventDetails.logoImage} style="width:100px;height:100px;border:2px solid #fff;border-radius:100%;object-fit:contain;object-position:center center"></a><tr><td style=height:20px><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>Mail Title :</b>  ${this.mailTemplateForm.value.mailTitle ? this.mailTemplateForm.value.mailTitle : 'N/A'}<tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:justify"align=left valign=top><b>Event Message / Description :</b> <span style=text-align:justify>${this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : 'N/A'}</span><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px 5px;text-align:left;border-bottom:1px solid #000"align=left valign=top><b>Event Details</b> <tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:20px 30px 10px;text-align:left"align=left valign=top><b>Address Line 1 :</b>  ${this.eventDetails.venueDetails.firstAddressLine ? this.eventDetails.venueDetails.firstAddressLine : 'N/A'}<tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>Address Line 2 :</b>  ${this.eventDetails.venueDetails.secondAddressLine ? this.eventDetails.venueDetails.secondAddressLine : 'N/A'}<tr><td><table style=width:100%><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>Country :</b>  ${this.countryName ? this.countryName : 'N/A'}<td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>State :</b>  ${this.stateName ? this.stateName : 'N/A'}<tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>City :</b>  ${this.eventDetails.venueDetails.city ? this.eventDetails.venueDetails.city : 'N/A'}<td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>Zip Code :</b>  ${this.eventDetails.venueDetails.zipcode ? this.eventDetails.venueDetails.zipcode : 'N/A'}</table><tr><td><table><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top><b>Contact Number :</b>  ${this.eventDetails.venueDetails.phoneNo ? this.eventDetails.venueDetails.phoneCode + this.eventDetails.venueDetails.phoneNo : 'N/A'}</table><tr><td><table><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"align=left valign=top *ngif=this.mailTemplateForm.value.eventLink><b>URL Links :</b> <a href=${this.mailTemplateForm.value.eventLink} target=_blank>${this.mailTemplateForm.value.eventLink ? this.mailTemplateForm.value.eventLink : 'N/A'}</a></table><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:5px 30px 5px;text-align:left;border-bottom:1px solid #000"align=left valign=top><tr><td style="font-family:Arial;font-size:14px;line-height:20px;padding:20px 10px 15px;text-align:center"align=left valign=top><b>You can download the app on</b><tr><td style="text-align:center;padding:0 0 30px"align=left><table style=width:100%><tr><td style="align-items:right;text-align:right;padding:10px 15px 10px"><a href=https://apps.apple.com/in/app/sangaraahi/id1661511878 target=_blank (click)=javascript:void(0)><img src=https://assets.stickpng.com/images/5a902db97f96951c82922874.png style=height:58px!important class=store-icon></a><td style="align-items:left;text-align:left;padding:10px 15px 10px"><a href="https://play.google.com/store/apps/details?id=com.communitynetworkingapp&hl=en"target=_blank><img src="https://images.squarespace-cdn.com/content/v1/59f7a1887131a53d15f4abf9/b04621bc-c95e-4dd4-a8f4-b097f67666bd/Get+it+on+Google+Play.png?format=750w"style=height:58px!important class=store-icon></a></table></table>`;

    //    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,shrink-to-fit=no"><title>Sangaraahi Mail Temp</title><style>@page{margin:0 0;padding:0 0;border:0 none!important}body{margin:0 0;padding:0 0}</style></head><body style="padding:0;margin:0;font-family:Arial;font-size:14px;line-height:20px"><table class="mail_temp_table" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:20px auto 20px;border-radius:20px;background-color:#fca62a"><tr><td style="background-image:url(${this.templateImage});background-size:cover;background-position:center center;background-color:#fff;position:relative;padding:0;height:100px;border-radius:20px 20px 0 0;text-align:left;padding:20px"><a href="#" target="_blank" style="position:relative;display:inline-block"><img src="${this.eventDetails.logoImage}" style="width:100px;height:100px;border:2px solid #fff;border-radius:100%;object-fit:contain;object-position:center center"></a></td></tr><tr><td style="height:20px"></td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>Mail Title :</b>&nbsp; ${this.mailTemplateForm.value.mailTitle ? this.mailTemplateForm.value.mailTitle : 'N/A'}</td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:justify"><b>Event Message / Description :</b>&nbsp;<span style="text-align:justify">${this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : 'N/A'}</span></td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px 5px;text-align:left;border-bottom:1px solid #000"><b>Event Details</b>&nbsp;</td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:20px 30px 10px;text-align:left"><b>Address Line1 :</b>&nbsp; ${this.eventDetails.venueDetails.firstAddressLine ? this.eventDetails.venueDetails.firstAddressLine : 'N/A'}</td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>Address Line1 :</b>&nbsp; ${this.eventDetails.venueDetails.secondAddressLine ? this.eventDetails.venueDetails.secondAddressLine : 'N/A'}</td></tr><tr><td><table style="width:100%"><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>Country :</b>&nbsp; ${this.countryName ? this.countryName : 'N/A'}</td><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>State :</b>&nbsp; ${this.stateName ? this.stateName : 'N/A'}</td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>City :</b>&nbsp; ${this.eventDetails.venueDetails.city ? this.eventDetails.venueDetails.city : 'N/A'}</td><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>Zip Code :</b>&nbsp; ${this.eventDetails.venueDetails.zipcode ? this.eventDetails.venueDetails.zipcode : 'N/A'}</td></tr></table></td></tr><tr><td><table style="width:100%"><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left"><b>Contact Number :</b>&nbsp; ${this.eventDetails.venueDetails.phoneNo ? this.eventDetails.venueDetails.phoneCode + this.eventDetails.venueDetails.phoneNo : 'N/A'}</td></tr></table></td></tr><tr><td><table style="width:100%"><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:10px 30px;text-align:left" *ngif="this.mailTemplateForm.value.eventLink"><b>URL Links :</b>&nbsp;<a target="_blank" href="${this.mailTemplateForm.value.eventLink}">${this.mailTemplateForm.value.eventLink ? this.mailTemplateForm.value.eventLink : 'N/A'}</a></td></tr></table></td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:5px 30px 5px;text-align:left;border-bottom:1px solid #000"></td></tr><tr><td align="left" valign="top" style="font-family:Arial;font-size:14px;line-height:20px;padding:20px 10px 15px;text-align:center"><b>You can download the app on</b></td></tr><tr><td align="left" style="text-align:center;padding:0 0 30px"><table style="width:100%"><tr><td style="align-items:right;text-align:right;padding:10px 15px 10px"><a href="#" target="_blank" (click)="javascript:void(0)"><img class="store-icon" style="height:58px!important" src="https://assets.stickpng.com/images/5a902db97f96951c82922874.png"></a></td><td style="align-items:left;text-align:left;padding:10px 15px 10px"><a href="#" target="_blank" (click)="javascript:void(0)"><img class="store-icon" style="height:58px!important" src="https://images.squarespace-cdn.com/content/v1/59f7a1887131a53d15f4abf9/b04621bc-c95e-4dd4-a8f4-b097f67666bd/Get+it+on+Google+Play.png?format=750w"></a></td></tr></table></td></tr></table></body></html>`;

    // return `<!doctype html>
    // <html lang="en">
    // <head>
    //   <meta charset="utf-8">
    //   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, shrink-to-fit=no">
    //   <title>Sangaraahi Mail Temp</title>
    //     <style>
    //       @page {
    //         margin: 0px 0px;
    //         padding: 0px 0px;
    //         border: 0px none !important;
    //       }
    //       body {
    //         margin: 0px 0px;
    //         padding: 0px 0px;
    //       }
    //       p {
    //         text-align:center;
    //       }
    //       .store-icons{
    //         justify-self: center;
    //       }
    //       .as-icon{
    //         align-self: center;
    //         justify-self: center;
    //       }
    //       .mail_temp_table {
    //         /* background-color: #d7e8e0; */
    //         background-color: #eadbeb;
    //       }
    //     </style>

    // </head>
    // <body style='padding:0; margin: 0; font-family: Arial; font-size: 14px; line-height: 20px;'>
    //   <table class="mail_temp_table" width='600' border='0' cellspacing='0' cellpadding='0'
    //   style="border-collapse:collapse; margin: 20px auto 20px;  border-radius: 20px; background-color: #FCA62A;">
    //       <tr>
    //           <td style="
    //           background-image: url(${this.templateImage});
    //           background-size: cover;
    //           background-position: center center;
    //           background-color: #fff;
    //           position: relative;
    //           text-align: center;
    //           padding: 0;
    //           height: 100px;
    //           border-radius: 20px 20px 0 0;
    //           " >
    //             <a  href="#" target="_blank" style="position: absolute; left: 30px; bottom: -50px;">
    //               <img src="${this.eventDetails.logoImage}"
    //               style="width: 100px; height: 100px; border: 2px solid #fff; border-radius: 100%; object-fit: contain; object-position: center center;">
    //             </a>
    //           </td>
    //       </tr>
    //       <tr>
    //         <td style="height: 55px; "></td>
    //       </tr>
    //       <tr>
    //         <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //           <b>Mail Title :</b> &nbsp; ${this.mailTemplateForm.value.mailTitle ? this.mailTemplateForm.value.mailTitle : 'N/A'}
    //         </td>
    //       </tr>
    //       <tr>
    //         <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: justify;' >
    //           <b>Event Message / Description :</b> &nbsp;
    //           <span style="text-align: justify;">${this.mailTemplateForm.value.description ? this.mailTemplateForm.value.description : 'N/A'}
    //         </span>
    //         </td>
    //       </tr>
    //       <tr>
    //         <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px 5px; text-align: left; border-bottom: 1px solid #000;' >
    //           <b>Event Details</b> &nbsp;
    //         </td>
    //       </tr>

    //       <tr>
    //         <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //           <b>Address Line1 :</b> &nbsp; ${this.eventDetails.venueDetails.firstAddressLine ? this.eventDetails.venueDetails.firstAddressLine : 'N/A'}
    //         </td>
    //       </tr>
    //       <tr>
    //         <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //           <b>Address Line1 :</b> &nbsp; ${this.eventDetails.venueDetails.secondAddressLine ? this.eventDetails.venueDetails.secondAddressLine : 'N/A'}
    //         </td>
    //       </tr>

    //       <tr>
    //         <td>
    //           <table>
    //             <tr>
    //               <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //                 <b>Country :</b> &nbsp; ${this.countryName ? this.countryName : 'N/A'}
    //               </td>
    //               <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //                 <b>State :</b> &nbsp; ${this.stateName ? this.stateName : 'N/A'}
    //               </td>
    //             </tr>

    //             <tr>
    //               <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //                 <b>City :</b> &nbsp; ${this.eventDetails.venueDetails.city ? this.eventDetails.venueDetails.city : 'N/A'}
    //               </td>
    //               <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //                 <b>Zip Code :</b> &nbsp; ${this.eventDetails.venueDetails.zipcode ? this.eventDetails.venueDetails.zipcode : 'N/A'}
    //               </td>
    //             </tr>

    //             <tr>
    //               <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //                 <b>Contact Number :</b> &nbsp; ${this.eventDetails.venueDetails.phoneNo ? this.eventDetails.venueDetails.phoneCode + this.eventDetails.venueDetails.phoneNo : 'N/A'}
    //               </td>
    //             </tr>

    //             <tr>
    //               <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 10px 30px; text-align: left;' >
    //                 <b>URL Links :</b> &nbsp; ${this.mailTemplateForm.value.eventLink ? this.mailTemplateForm.value.eventLink : 'N/A'}
    //               </td>
    //             </tr>
    //           </table>
    //         </td>
    //       </tr>

    //       <tr>
    //         <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 5px 30px 5px; text-align: left; border-bottom: 1px solid #000;' >
    //         </td>
    //       </tr>

    //       <tr>
    //         <tr>
    //           <td align='center' valign='top' style='font-family: Arial; font-size: 14px; line-height: 20px; padding: 20px 10px 15px;  text-align: center;' >
    //             <b>You can download the app on</b>
    //           </td>
    //         </tr>
    //         <tr>
    //         <td align="center" style="text-align: center; padding: 0px 0px 30px;">
    //           <table style="width: 100%;">
    //             <tr>
    //               <td style="align-items: right; text-align: right; padding: 20px 15px 20px;">
    //                 <a href="https://apps.apple.com/us/app/the-empathy-set/id1570154720" target="_blank" (click)="javascript:void(0)">
    //                   <img
    //                     class="store-icon"
    //                     style="height: 58px !important; "
    //                     src="https://assets.stickpng.com/images/5a902db97f96951c82922874.png">
    //                 </a>
    //               </td>
    //               <td style="align-items: left; text-align: left; padding: 20px 15px 20px;">
    //                 <a href="https://play.google.com/store/apps/details?id=com.johnford.tes" target="_blank" (click)="javascript:void(0)">
    //                   <img
    //                     class="store-icon"
    //                     style="height: 58px !important; "
    //                     src="https://images.squarespace-cdn.com/content/v1/59f7a1887131a53d15f4abf9/b04621bc-c95e-4dd4-a8f4-b097f67666bd/Get+it+on+Google+Play.png?format=750w"/>
    //                 </a>
    //               </td>
    //             </tr>
    //           </table>
    //         </td>
    //       </tr>
    //   </table>
    // </body>
    // </html>
    // `
  }

  /**Using for cancel page.... */
  cancel(){
    this.router.navigateByUrl('email-template/template-list');
  }

  /**Using for get event details...... */
  getEventByID(event: any) {
    let params: any; // Declare params initially

    if (this.templateId) {
        params = {
            getMyCommunityEventByIdId: event
        };
    } else {
        const eventId = event.target.value;
        params = {
            getMyCommunityEventByIdId: eventId
        };
    }

    this.loaderService.show();

    this.eventSubscriber = this.apolloClient
        .setModule('getMyCommunityEventByID')
        .queryData(params)
        .subscribe(
            (response: GeneralResponse) => {
                if (response.error) {
                    this.alertService.error(response.message);
                    return;
                } else {
                    this.eventDetails = response?.data;
                    switch (this.eventDetails?.venueDetails?.country) {
                        case "IN":
                            this.countryName = "India";
                            break;
                        case "US":
                            this.countryName = "United States";
                            break;
                        case "GB":
                            this.countryName = "United Kingdom";
                            break;
                        case "CA":
                            this.countryName = "Canada";
                            break;
                        default:
                            this.countryName = "N/A";
                            break;
                    }
                    this.changeState();
                }
            },
            (error) => {
                this.loaderService.hide();
                console.error("Error fetching event details:", error);
            },
            () => {
                this.loaderService.hide(); // Hide loader on completion
            }
        );
}


  /**Using for state change in depends on country */
  changeState(){
    const params= {
      data:{
        countryCode: this.eventDetails?.venueDetails?.country
      }
    }
    this.loaderService.show();
    this.stateSubscriber = this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getState = response.data;
        this.getState.filter((val:any)=>{
          if(val.stateCode === this.eventDetails?.venueDetails?.state){
            this.stateName = val.name;
          }
        })


      }
    });
    this.loaderService.hide();
  }
}

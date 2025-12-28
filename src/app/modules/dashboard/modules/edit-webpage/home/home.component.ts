import { Component, OnDestroy } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as S3 from 'aws-sdk/clients/s3';
import { environment } from 'src/environments/environment';
import { CommonService } from '../../../services/common.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WebpageComponent } from '../webpage/webpage.component';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { Output, EventEmitter } from '@angular/core';
import { paramService } from 'src/app/shared/params/params';
import { Subscription } from 'rxjs';
declare var window: any;
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
//declare var CKEDITOR: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  @Output() newItemEvent = new EventEmitter<boolean>();
  logoImage: String = "assets/images/banner-img-up.png";
  bannerImage: String = "assets/images/banner-img-up.png";
  imageSrc!: any;
  homeSettingForm!: FormGroup;
  homeSettingsData: any;
  videosData: any;
  urlSafe: SafeResourceUrl | undefined;
  events: any;
  announcmentDetails: any;
  $modal: any;
  desc: any;
  announcementTitle!:string
  eventTitle!:string;
  eventDescription!:string;
  eventAddress!:string;
  eventStartDate!:string;
  eventEndDate!:string;
  groups: any;
  logoImageChangedEvent: any;
  bannerImageChangedEvent: any;
  logoCroppedImage: any;
  bannerCroppedImage: any;
  logoOpenCropImageModal: boolean= false;
  bannerOpenCropImageModal: boolean= false;
  getFileName: any;
  tabChange: boolean = false;
  groupTitle!:string;
  groupDescription!:string;
  groupmemberCount!:number;
  groupStartDate!:string;
  groupEndDate!:string;
  imageUrl: any;
  // public editorConfig = {
  //   toolbar: [],
  //   removePlugins: 'toolbar,elementspath',
  //   resize_enabled: false,
  //   //contentsCss: ['/home.component.css'],
  //   extraCss: '.cke_top { border: none }', 
  // };

  // editor: any;
  private getViddeoSubscriptionData!: Subscription;
  constructor(
    private builder: FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private validator: ValidatorService,
    private domSanitizer: DomSanitizer,
    private webpageComponent : WebpageComponent,
    private paramService: paramService,
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit(): void {
    //console.log("home111");
    
    this.initForm();
    this.getCommunityHomePageOverviewByID();
    this.getCommunityVideos();
    this.getEvent();
    this.getAnnouncementDetails();
    this.getGroups();
    //this.editor = CKEDITOR.instances['editor']; 
  }

  /* -- Owl carousel -- script -- start --*/
  customOptions: OwlOptions = {
    //loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    //dots: true,
    navSpeed: 700,
    margin: 30,
    //stagePadding: 50,
    //navText: ['P', 'N'],
    navText: [
      '<img class="edit_webPageTopTab_icon" src="assets/images/carousel-arrow-left-btn.png">',
      '<img class="edit_webPageTopTab_icon" src="assets/images/carousel-arrow-right-btn.png">'
    ],
    dots: false, // if you don't want dots, change to false

    responsive: {
      0: {
        items: 1
      },
      568: {
        items: 1
      },
      991: {
        items: 2
      },
      1024: {
        items: 3
      }
    },
    nav: true
  }
  /* -- Owl carousel -- script -- end --*/

  initForm() {
    this.homeSettingForm = this.builder.group({
      communityDescription: ['',[Validators.required, this.validator.isEmpty]]
    })
  }

  getCommunityHomePageOverviewByID() {
    const id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        id: id
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getCommunityHomePageOverviewByID').queryData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if (response.error) {
        this.alertService.error(response.message);
      } else {
        this.homeSettingsData = response.data;
        this.homeSettingForm.patchValue({
          communityDescription: this.homeSettingsData.communityDescription,
        });
        this.bannerImage = this.homeSettingsData.bannerImage;
        this.logoImage = this.homeSettingsData.logoImage;
      }
    });
  }

  getCommunityVideos() {
    //console.log("home222");
    const id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        id: id
      }
    }
    this.loaderService.show();
    this.getViddeoSubscriptionData = this.apolloClient.setModule('getCommunityVideos').queryData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if (response.error) {
        this.alertService.error(response.message);
      } else {
        this.videosData = response.data;
        this.videosData.map((elem: any) => {
          elem.hlink = this.domSanitizer.bypassSecurityTrustResourceUrl(elem.link);
        })
      }
    });
  }

  saveDetails(value: any) {
    const id = this.storageService.getLocalStorageItem('communtityId');
    if(this.homeSettingForm.value.communityDescription === '' || this.homeSettingForm.value.communityDescription === null || this.homeSettingForm.value.communityDescription === undefined){
      this.alertService.error("Community description is required");
      return;
    }
    if(this.logoImage === null || this.logoImage === '' || this.logoImage === undefined){
      this.alertService.error("Please upload your community logo");
      return;
    }
    if(this.bannerImage === null || this.bannerImage === '' || this.bannerImage === undefined){
      this.alertService.error("Please upload your community banner image");
      return;
    }
    const params: any = {};
    params['data'] = {
      id: id,
      bannerImage: this.bannerImage,
      logoImage: this.logoImage,
      communityDescription: this.homeSettingForm.value.communityDescription
    }

    this.loaderService.show();
    this.apolloClient.setModule("updateHomePageOverview").mutateData(params).subscribe((response: any) => {
      if (response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
      else {
        this.loaderService.hide();
        this.alertService.error("Home data saved successfully");
        this.tabChange = true;
        if(value === 'next'){
          this.webpageComponent.showAnnouncement();
        }
        else{
          this.router.navigateByUrl('community-management/profile-edit');
        }
      }
    });
  }

  undoSetting() {
    this.homeSettingForm.patchValue({
      communityDescription: this.homeSettingsData.communityDescription,
    });
    this.bannerImage = this.homeSettingsData.bannerImage;
    this.logoImage = this.homeSettingsData.logoImage;

  }

  previewImage(event: any, imageName: String) {
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    if(imageName === 'logoImage'){
      this.logoOpenCropImageModal = true;
      this.logoImageChangedEvent = event;
    }
    else{
      this.bannerOpenCropImageModal = true;
      this.bannerImageChangedEvent = event;
    }
   
    if (event.target.files && event.target.files[0]) {
      let size = event.target.files[0].size / 1024;
      if (size > 5120) { //size < 2048
        this.alertService.error("Size shouldn't be greater than 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.imageSrc = event.target?.result;

      }

    }
    //this.uploadFileToS3Bucket(event, imageName);
  }

  //Image Croped...............
  cropImg(event: ImageCroppedEvent, imageName: String) {
    //console.log("event.......",event);
    if(imageName === 'logoImage'){
      this.logoCroppedImage = event.blob;
      if (this.logoCroppedImage && this.logoCroppedImage.type.startsWith('image/')) {
        this.fileUploadService.blobToArrayBuffer(this.logoCroppedImage).then(arrayBuffer => {
          const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.logoCroppedImage.type);
          this.imageUrl = file;
        }).catch(err => {
          console.error("Error converting blob to ArrayBuffer:", err);
        });
      } else {
        console.error("Invalid blob type:", this.logoCroppedImage?.type);
      }
    }
    else{
      this.bannerCroppedImage = event.blob;
      if (this.bannerCroppedImage && this.bannerCroppedImage.type.startsWith('image/')) {
        this.fileUploadService.blobToArrayBuffer(this.bannerCroppedImage).then(arrayBuffer => {
          const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.bannerCroppedImage.type);
          this.imageUrl = file;
        }).catch(err => {
          console.error("Error converting blob to ArrayBuffer:", err);
        });
      } else {
        console.error("Invalid blob type:", this.bannerCroppedImage?.type);
      }
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

  uploadFileToS3Bucket(fileName: any, imageName: any) {
    // console.log("fileName.......",fileName);
    // console.log("imageName.....",imageName);
    
    // const file = fileName.target.files[0] ? fileName.target.files[0] : '';
    // const files = fileName.target.files ? fileName.target.files : '';
    //if (files && file) {
    this.loaderService.show();
      if(fileName){
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
      bucket.upload(params, (err: any, data: any) => {
        if (err) {
          this.alertService.error("There was an error uploading your file");
          this.loaderService.hide();
          return false;
        }
        else {
          //this.alertService.error("Successfully uploaded file.");
          this.loaderService.hide();
          if (imageName === 'logoImage') {
            this.logoImage = data.Location;
          } else {
            this.bannerImage = data.Location;
          }
          return true;
        }
        
      });
    } else {
      this.loaderService.hide();
      this.alertService.error("No file uploaded.");
    }
  }

  //Developed by Arnab Sadhukhan.................
  getEvent() {
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params: any = {};
    params['data'] = {
      communityId: community_id,
      page: 1,
      //eventType: "Public",
      //isActive: true
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.alertService.error(response.message);
        return;
      }
      else {
        this.events = response.data.events;
      }
      this.loaderService.hide();
    })
  }

  //Developed by Arnab Sadhukhan.................
  getAnnouncementDetails() {
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        communityId: community_id,
        page: 1,
        // announcementType: "Public",
        //isActive: true
          
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getAllAnnouncementOrganization').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if (response.error) {
        this.alertService.error(response.message);
      } else {
        this.announcmentDetails = response.data.announcements;
      }
    });
  }

  //Developed by Arnab Sadhukhan.................
  showDescription(item: any) {
    this.announcementTitle = item.title;
    this.desc = item.description;
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("announcementDescription")
    );
    this.$modal.show();
  }
  
  //Developed by Arnab Sadhukhan.................
  ShowEventDetails(item:any){
    this.eventTitle = item.title;
    this.eventDescription = item.description;
    this.eventAddress = item.venueDetails.firstAddressLine+ ',' + item.venueDetails.city + ',' + item.venueDetails.state + ',' + item.venueDetails.country + '-' + item.venueDetails.zipcode;
    this.eventStartDate = item.date.from;
    this.eventEndDate = item.date.to;
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("eventDetails")
    );
    this.$modal.show();
  }

  ShowGroupDetails(item:any){
    this.groupTitle = item?.name;
    this.groupDescription = item?.description;
    this.groupmemberCount = item?.memberCount
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("groupDetails")
    );
    this.$modal.show();
  }

  getGroups() {
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params: any = {};
    params['data'] = {
      communityId: community_id,
      page: 1,
      isActive: true
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityGroup').queryData(params).subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.alertService.error(response.message);
        return;
      }
      else {
        this.groups = response.data.groups;
      }
      this.loaderService.hide();
    })
  }

  cancel(){
    this.router.navigateByUrl('community-management/profile-edit')
  }

  deleteBannerImage(){
    this.bannerImage = '';
  }

  deleteLogoImage(){
    this.logoImage = '';
  }

  saveImage(imageName:any){
    if(imageName === 'logoImage'){
      this.logoOpenCropImageModal = false;
      // this.uploadFileToS3Bucket(this.logoCroppedImage,imageName);
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
        this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
          this.logoImage = base64; // only for preview
          const formData = new FormData();
          formData.append('type', 'community-logo-image');
          formData.append('images', this.imageUrl); // this.imageUrl is File
          this.fileUploadService.sendFile(formData).subscribe({
            next: (res) => {
              // console.log('Upload success:', res);
              this.logoImage = res.urls[0]
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
    else{
      this.bannerOpenCropImageModal = false;
      // this.uploadFileToS3Bucket(this.bannerCroppedImage,imageName);
       if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
        this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
          this.bannerImage = base64; // only for preview
          const formData = new FormData();
          formData.append('type', 'community-banner-image');
          formData.append('images', this.imageUrl); // this.imageUrl is File
          this.fileUploadService.sendFile(formData).subscribe({
            next: (res) => {
              // console.log('Upload success:', res);
              this.bannerImage = res.urls[0]
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
  }

  closeImage(imageName:any){
    if(imageName === 'logoImage'){
      this.logoOpenCropImageModal = false;
    }
    else{
      this.bannerOpenCropImageModal = false;
    }

  }

  viewMoreVideo(){
    this.webpageComponent.showVideo();
  }

  viewMoreAnnouncement(){
    //this.webpageComponent.showAnnouncement();
    this.paramService.updatecurrentRoute('/announcements');
    this.router.navigateByUrl('/announcements');
  }

  addAnnouncement(){
    this.paramService.updatecurrentRoute('/announcements/add');
    this.router.navigateByUrl('/announcements/add');
  }

  viewEvent(){
    this.paramService.updatecurrentRoute('/events');
    this.router.navigateByUrl('/events');
  }

  addEvent(){
    this.paramService.updatecurrentRoute('/events/add');
    this.router.navigateByUrl('/events/add');
  }

  viewGroup(){
    this.paramService.updatecurrentRoute('/groups');
    this.router.navigateByUrl('/groups');
  }

  addGroup(){
    this.paramService.updatecurrentRoute('/groups/add');
    this.router.navigateByUrl('/groups/add');
  }

  ngOnDestroy(): void {
    // if (this.editor) {
    //   this.editor.destroy(); // Destroy CKEditor instance on component destruction
    // }
    if(this.getViddeoSubscriptionData){
      this.getViddeoSubscriptionData.unsubscribe();
    }
    // console.log(this.getViddeoSubscriptionData);
    
    // if(this.homeSettingForm.value.communityDescription !== this.homeSettingsData.communityDescription){
    //   console.log("true");
      
    //   this.newItemEvent.emit(true);
    // }
    // else{
    //   console.log("false");
      
    //   this.newItemEvent.emit(false);
    // }
  }

}

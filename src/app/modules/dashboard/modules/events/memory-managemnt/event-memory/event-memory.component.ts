import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { paramService } from 'src/app/shared/params/params';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {Memory} from 'src/app/shared/models/memory-list.model'
import {memoryCountResult} from 'src/app/shared/models/memory-count-details.model';
declare var window:any;
import * as S3 from 'aws-sdk/clients/s3';
import * as FileSaver from 'file-saver';
import {environment} from 'src/environments/environment';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { CommonService } from 'src/app/modules/dashboard/services/common.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'app-event-memory',
  templateUrl: './event-memory.component.html',
  styleUrls: ['./event-memory.component.css']
})
export class EventMemoryComponent implements OnInit, OnDestroy {
  @ViewChild('fileImage') fileImage!: ElementRef;
  eventIdSubscriber!: Subscription;
  eventDetailsSubscriber!: Subscription;
  countingSubscriber!: Subscription;
  statusSubscriber!: Subscription;
  memoryList: Memory[] = [];
  eventId: any;
  eventData: any;
  isActive: boolean = false;
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  getValue!: number;
  getCountData: memoryCountResult = {};
  $modal: any;
  image!: string;
  cropImageModal: boolean= false;
  thumbnailCroppedImage: any;
  CroppedImage: any;
  getFileName!: string;
  ImageChangedEvent: any;
  imageSrc: any;
  uploadForm!: FormGroup;
  filterForm!: FormGroup;
  tomorrow!: string;
  toggleFilter:boolean = false;
  $modal1: any;
  $modal2: any;
  getUploadImg: any;
  imgId:any;
  approveStatus: boolean = false;
  imgStatus: boolean = false;
  tabValue: any;
  imageCutOffDate!:string;
  imageUrl: any;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private paramService:paramService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private validator: ValidatorService,
    private formBuilder : FormBuilder,
    private commonService : CommonService,
    private datePipe: DatePipe,
    private fileUploadService: FileUploadService
  ){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.tomorrow = tomorrow.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();
    this.eventIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params=>{
        this.eventId = params.get('id');
      },
      error: err=>{}
    });
    this.getMemoryList(0,this.current);
    if(this.eventId){
      this.getEventDetail();
      this.getCountingValue();
      this.generateSearchForm();
    }
  }

  /**Using for  intialize task form */
  initForm(){
    this.uploadForm = this.formBuilder.group({
      // requiredDate: ['',[Validators.required, this.validator.isEmpty]],
      requiredDate: ['']
    })
  }

  generateSearchForm(){
    this.filterForm = new FormGroup({
      fromDate: new FormControl(''),
      toDate: new FormControl('')
    });
  }

  ngOnDestroy(): void {
    if(this.eventIdSubscriber){
      this.eventIdSubscriber.unsubscribe();
    }
    if(this.eventDetailsSubscriber){
      this.eventDetailsSubscriber.unsubscribe();
    }
    if(this.statusSubscriber){
      this.statusSubscriber.unsubscribe();
    }
  }

  getMemoryList(getValue:any, page : Number){
    //const searchData = this.activatedRoute.snapshot.paramMap.get("value") ? this.activatedRoute.snapshot.paramMap.get("value") : ''
    this.tabValue = getValue
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      page: page,
    }
    if(this.filterForm?.value.fromDate && this.filterForm?.value.fromDate!='' && this.filterForm?.value.toDate && this.filterForm?.value.toDate!=''){
      params['data'].fromDate = this.datePipe.transform(this.filterForm.value.fromDate,'yyyy-MM-dd');
      params['data'].toDate = this.datePipe.transform(this.filterForm.value.toDate,'yyyy-MM-dd');
    }
    if(getValue === 1){
    this.isActive = true;
    params['data'].imageApprove = true;
    this.loaderService.show();
    this.apolloClient.setModule('getAllUploadImage').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
          this.memoryList = response.data?.images;
          this.totalData = response.data.total;
          this.from = response.data?.from;
          this.to = response.data?.to;
          if(response.data.total !== 0) {
            this.totalPageNo = Math.ceil(response.data.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }  
        }
    });
    this.loaderService.hide();
    }
    else{
      this.isActive = false;
      params['data'].imageApprove = false;
      this.loaderService.show();
      this.apolloClient.setModule('getAllUploadImage').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
          this.memoryList = response.data?.images;
          this.totalData = response.data.total;
          this.from = response.data?.from;
          this.to = response.data?.to;
          if(response.data.total !== 0) {
            this.totalPageNo = Math.ceil(response.data.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }    
        }
      });
      this.loaderService.hide();
    }
    
  }

  /**Using for get the event name*/
  getEventDetail()
  {
    const params:any= {};
    params['getMyCommunityEventByIdId'] = this.eventId;
    this.loaderService.show();
    this.eventDetailsSubscriber = this.apolloClient.setModule('getMyCommunityEventByID').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.eventData = response.data;
      }
    });
  }

  /**Using for pagination */
  public onGoTo(page: number): void {
    this.current = page
    if(this.isActive){
      this.getMemoryList(1, this.current);
    }
    else{
      this.getMemoryList(0, this.current);
    }
  }

  /**Using for pagination go to the next page */
  public onNext(page: number): void {
    this.current = page + 1;
    if(this.isActive){
      this.getMemoryList(1, this.current);
    }
    else{
      this.getMemoryList(0, this.current);
    }
  }

  /**Using for pagination go to the previous page */
  public onPrevious(page: number): void {
    this.current = page - 1;
    if(this.isActive){
      this.getMemoryList(1, this.current);
    }
    else{
      this.getMemoryList(0, this.current);
    }
  }

  /**Using for get the count value */
  getCountingValue(){
    const params:any={};
    params['data'] = {
      eventId: this.eventId
    }
    this.countingSubscriber = this.apolloClient.setModule('getUploadImageListCounting').queryData(params).subscribe({
      next: (response: GeneralResponse) =>{
        if(response.error) {
          this.alertService.error(response.message);
          return;
        }
        else{
          this.getCountData = response.data;
        }
      },
      error: err=>{
        console.log(err);
      }
    })
  }

  /** Using for image upload modal open*/
  imageUploadModal(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("imageUploadModal")
    );
    this.$modal.show();
  }

  /**Using for save cropped image */
  saveImage(imageName:any){
      this.cropImageModal = false;
      // this.uploadFileToS3Bucket(this.CroppedImage);
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.image = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'event-memory-image');
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


  /**Using For image preview */
  previewImage(event: any, imageName: String) {
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.cropImageModal = true;
    this.ImageChangedEvent = event;
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
  }

   /**Using for image upload in s3 bucket */
   uploadFileToS3Bucket(fileName: any) {
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
            return false;
          }
          else {
            //this.alertService.error("Successfully uploaded file.");
            this.image = data.Location;
            return true;
          }
        });
      } else {
        this.alertService.error("No file uploaded.");
      }
  }

  /**Using for cancel cropped image */
  closeImage(imageName:any){
    console.log("imageName.....");
    
      this.cropImageModal = false;
  }

  /**Start Image Croped........ */
  cropImg(event: ImageCroppedEvent, imageName: String) {
      // this.CroppedImage = event.blob;    
       this.CroppedImage = event.blob;
        if (this.CroppedImage && this.CroppedImage.type.startsWith('image/')) {
            this.fileUploadService.blobToArrayBuffer(this.CroppedImage).then(arrayBuffer => {
              const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.CroppedImage.type);
              this.imageUrl = file;
            }).catch(err => {
              console.error("Error converting blob to ArrayBuffer:", err);
            });
          } else {
            console.error("Invalid blob type:", this.CroppedImage?.type);
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
  /**End Croped Image............ */

  /**Using for delete image */
  deleteImage(){
    this.image = '';
    this.fileImage.nativeElement.value = '';
  }

  /**Using for close the upload modal */
  closeModal(){
    this.$modal.hide();
    this.uploadForm.controls['requiredDate'].setValue('');
    this.image = '';
    this.fileImage.nativeElement.value = '';

  }

  /**Using for Save the uploaded image */
  saveUploadImage(){
    const params: any = {};
    const saveData = this.uploadForm.value;
    if(saveData.requiredDate && this.image === '' || this.image === null || this.image === undefined){
      this.alertService.error("Please upload image");
      return;
    }
    params['data'] = {
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      eventId: this.eventId ? this.eventId : '',
      uploadedImage: this.image ? this.image : '',
      imageDeadLine: saveData.requiredDate ? saveData.requiredDate : ''
    }
    this.loaderService.show();
    this.apolloClient.setModule("uploadImage").mutateData(params).subscribe((response:any) => {
      if(response.error){
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
       else{
        this.alertService.error(response.message);
        this.getMemoryList(0,1);
        this.getCountingValue();
       }
    });
    this.loaderService.hide();
    this.$modal.hide();
    this.uploadForm.controls['requiredDate'].setValue('');
    this.image = '';
    this.fileImage.nativeElement.value = '';
  }

  /**Using for toggle search */
  toggle(){
    if( this.toggleFilter === false){
      this.clearDateFilter()
      this.toggleFilter = true;
    }
    else{
      this.toggleFilter = false;
    }
  }

  /**Using for clear data */

  clearDateFilter() {
    this.filterForm.controls['fromDate'].setValue('');
    this.filterForm.controls['toDate'].setValue('');
    this.getMemoryList(0,this.current);
  }

  /**Using remove Image from list */
  deleteUploadImage(ImageId:any,val:number){
    Swal.fire({
      title: 'Are you sure you want to delete this Image?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        this.rejectImage(ImageId,val);
      }
    })
  }

  /**Using remove Image from list */
  rejectImage(ImageId:any,val:number){
    const params:any= {};
    params['data'] = {
      imageId: ImageId,
      imageRejecte: true,
      imageApprove: false
    };
    this.loaderService.show();
    this.eventDetailsSubscriber = this.apolloClient.setModule('approveOrRejectImage').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        // this.alertService.error(response.message);
        this.alertService.error("Image Rejected Successfully!");
        if(val === 1){
          this.$modal1.hide();
        }
        this.getMemoryList(this.tabValue,this.current);
        this.getCountingValue();
      }
    });
  }

  /**Using remove Image from list */
  approvedImage(ImageId:any,val:number){
    const params:any= {};
    params['data'] = {
      imageId: ImageId,
      imageRejecte: false,
      imageApprove: true
    };
    this.loaderService.show();
    this.eventDetailsSubscriber = this.apolloClient.setModule('approveOrRejectImage').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        // this.alertService.error(response.message);
        this.alertService.error("Image Approved Successfully!");
        if(val === 1){
          this.$modal1.hide();
        }
        this.getMemoryList(1,this.current);
        this.getCountingValue();
      }
    });
  }

  /**Using for get data from uploaded image */
  getUploadImage(img:any,satus:any,id:any,imgStatus:any,imageDeadLine:any){
    this.getUploadImg = img;
    this.imgId = id;
    this.approveStatus = satus;
    this.imgStatus = imgStatus;
    this.imageCutOffDate = imageDeadLine;
    this.showUploadImage();
  }

  /**Using For open upload image modal */
  showUploadImage(){
    this.$modal1 = new window.bootstrap.Modal(
      document.getElementById("uploadImage")
    );
    this.$modal1.show();
  }

  getApprovedImage(img:any,id:any){
    this.getUploadImg = img;
    this.imgId = id;
    this.showUploadImage();
  }

  /**Using for change status */
  statusChange(imgId:any,val:number){
    const params:any= {};
    params['data'] = {
      imageId: imgId
    }
    this.loaderService.show();
    this.statusSubscriber = this.apolloClient.setModule('imageStatusChange').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.alertService.error(response.message);
        this.getMemoryList(1,this.current);
        if(val === 2){
          this.$modal1.hide();
        }
      }
      this.loaderService.hide();
    });
  }
}

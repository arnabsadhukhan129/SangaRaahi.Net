import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import {viewBlog} from 'src/app/shared/models/view-blog.module';
import { Event } from 'src/app/shared/models/events.model';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit,OnDestroy {
  @ViewChild('fileImage') fileImage!: ElementRef;
  @ViewChild('fileThumbnail') fileThumbnail!: ElementRef;
  @ViewChild('filePdf') filePdf!: ElementRef;
  blogDeatilsSaveSubscriber!: Subscription;
  blogIdSubscriber!: Subscription;
  getBlogsSubscriber!: Subscription;
  blogEditIdSubscriber!: Subscription;
  thumbnailImage!: String;
  mainImage!: any;
  getFileName!: string;
  imageSrc: any;
  thumbnailCroppedImage: any;
  thumbnailOpenCropImageModal: boolean= false;
  thumbnailImageChangedEvent: any;
  CroppedImage: any;
  OpenCropImageModal: boolean= false;
  ImageChangedEvent: any;
  blogForm!: FormGroup;
  pdfs: any;
  blogId: any;
  blogEditId: any;
  blogDetails: any;
  getPdfFile!: string;
  evetList: Event[] = [];
  hasevent: boolean = false;
  selectedFiles: any = [];
  uploadedImages: any = [];
  selectedPdfs: any = [];
  uploadPdf: any = [];
  uploadpdfs: any = [];
  pdfFile:any = [];
  totalImageCount: number = 0;
  totalPdfCount: number = 0;
  imageUrl:any;

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
     private fileUploadService: FileUploadService
  ){}
  ngOnInit(){
    this.blogIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.blogId = params.get('id');
      },
      error: err => {}
    });
    this.blogEditIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.blogEditId = params.get('blogId');
      },
      error: err => {}
    });
    if(this.blogId){
      this.getBlogDetails();
    }
    if(this.blogEditId){
      this.getBlogDetails();
    }
    this.initForm();
    this.getPublicEvent();
  }

  ngOnDestroy(){
    if(this.blogDeatilsSaveSubscriber){
      this.blogDeatilsSaveSubscriber.unsubscribe();
    }
    if(this.blogIdSubscriber){
      this.blogIdSubscriber.unsubscribe();
    }
    if(this.getBlogsSubscriber){
      this.getBlogsSubscriber.unsubscribe();
    }
    if(this.blogEditIdSubscriber){
      this.blogEditIdSubscriber.unsubscribe();
    }
  }

  /**Using for  intialize blog form */
  initForm(){
    this.blogForm = this.formBuilder.group({
      eventId: [''],
      blogTitle: ['',[Validators.required, this.validator.isEmpty, this.validator.nameIsLong]],
      blogCategory: ['',[Validators.required, this.validator.isEmpty]],
      blogDescription: ['',[Validators.required, this.validator.isEmpty]],
      blogShortDesc: ['',[Validators.required, this.validator.isEmpty, this.validator.nameIsLong]],
      fbLink: [''],
      twitterLink: [''],
      likedinLink: ['']
    })
  }

  // /**Using For thumbnail image preview */
  // previewImage(event: any, imageName: String) {
  //   const val = event.target.value.split("\\").pop();
  //   this.getFileName = val;
  //   if(imageName === 'thumbnailImage'){
  //     this.thumbnailOpenCropImageModal = true;
  //     this.thumbnailImageChangedEvent = event;
  //   }
  //   else if(imageName === 'mainImage'){
  //     this.OpenCropImageModal = true;
  //     this.ImageChangedEvent = event;
  //   }
  //   if (event.target.files && event.target.files[0]) {
  //     let size = event.target.files[0].size / 1024;
  //     if (size > 5120) { //size < 2048
  //       this.alertService.error("Size shouldn't be greater than 5 MB.");
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]); // read file as data url
  //     reader.onload = (event) => { // called once readAsDataURL is completed
  //       this.imageSrc = event.target?.result;
  //     }
  //     if(imageName === 'pdfs'){
  //       this.uploadFileToS3Bucket(event, imageName);
  //     }
  //   }
  // }

   /**Uploaded image preview */
  previewImage(event:any,imageName: String){
    const val = event.target.value.split("\\").pop();
    this.getFileName = val;
    this.thumbnailOpenCropImageModal = true;
    this.thumbnailImageChangedEvent = event;
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
    //this.uploadFileToS3Bucket(this.imageChangedEvent);
  }

  

  /**Using for image upload in s3 bucket */
  uploadFileToS3Bucket(fileName: any,imageName: any) {
    if(imageName === 'pdfs'){
      const file = fileName.target.files[0] ? fileName.target.files[0] : '';
      const files = fileName.target.files ? fileName.target.files : '';
      const extension = file.name.substr(file.name.lastIndexOf('.'));
        if((extension.toLowerCase() === '.exe') || (extension.toLowerCase() === '.gif') || (extension.toLowerCase() === '.twbx') || (extension.toLowerCase() === '.xlsx') || (extension.toLowerCase() === '.doc') || (extension.toLowerCase() === '.xls') ||(extension.toLowerCase() === '.docx') || (extension.toLowerCase() === '.ppt') || (extension.toLowerCase() === '.pptx') || (extension.toLowerCase() === '.txt') ||
        (extension.toLowerCase() === '.jpg') || (extension.toLowerCase() === '.jpeg') ||
        (extension.toLowerCase() === '.png')){
          this.alertService.error("Could allow to upload only .pdf files");
          return;
        }
        if (file && files) {
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
                Key: file.name,
                Body: file,
                ACL: 'public-read'
            };
          bucket.upload(params,  (err: any, data: any) => {
            if (err) {
              this.alertService.error("There was an error uploading your file");
              return false;
            }
            else {
                this.alertService.error("Successfully uploaded" + ' ' +file.name + 'file');
                this.pdfs = data.Location;         
                this.getFileName = file.name;
                this.getPdfFile = this.getFileName;
              return true;
            }
          });
        }else {
          this.alertService.error("No file uploaded.");
        }
    }
    else{
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
            if (imageName === 'thumbnailImage') {
              this.thumbnailImage = data.Location;
            }
            else{
              this.mainImage = data.Location;
            } 
            return true;
          }
        });
      } else {
        this.alertService.error("No file uploaded.");
      }
  }
  }

  /**Using For download pdf file */
  downloadFile(){
    FileSaver.saveAs(this.pdfs,this.getFileName)
  }

  /**Using for uploaded delete pdfs file */
  deletePdfs(){
    this.pdfs = '';
    this.getFileName = ''
    this.filePdf.nativeElement.value = '';
  }

  // //Image Croped...............
  // cropImg(event: ImageCroppedEvent, imageName: String) {
  //   if(imageName === 'thumbnailImage'){
  //     this.thumbnailCroppedImage = event.blob;
  //   }
  //   else{
  //     this.CroppedImage = event.blob;
  //   }     
  // }    

  //Image Croped...............
  cropImg(event: ImageCroppedEvent,imageName: String) {
    //console.log("event.......",event);
    this.thumbnailCroppedImage = event.blob;
    if (this.thumbnailCroppedImage && this.thumbnailCroppedImage.type.startsWith('image/')) {
        this.fileUploadService.blobToArrayBuffer(this.thumbnailCroppedImage).then(arrayBuffer => {
          const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.thumbnailCroppedImage.type);
          this.imageUrl = file;
        }).catch(err => {
          console.error("Error converting blob to ArrayBuffer:", err);
        });
      } else {
        console.error("Invalid blob type:", this.thumbnailCroppedImage?.type);
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

  /**Using for delete thumbnail image */
  deletethumbnailImage(){
    this.thumbnailImage = '';
    this.fileThumbnail.nativeElement.value = '';
  }

  /**Using for delete image */
  deleteImage(){
    this.mainImage = '';
    this.fileImage.nativeElement.value = '';
  }

  /**Using for cancel cropped image */
  closeImage(imageName:any){
    if(imageName === 'thumbnailImage'){
      this.thumbnailOpenCropImageModal = false;
    }
    else{
      this.OpenCropImageModal = false;
    }
  }

  // /**Using for save cropped image */
  // saveImage(imageName:any){
  //   if(imageName === 'thumbnailImage'){
  //     this.thumbnailOpenCropImageModal = false;
  //     this.uploadFileToS3Bucket(this.thumbnailCroppedImage,imageName);
  //   }
  //   else{
  //     this.OpenCropImageModal = false;
  //     this.uploadFileToS3Bucket(this.CroppedImage,imageName);
  //   }
  // }

  /**Using for save uploaded image */
  saveImage(imageName:any){
      this.thumbnailOpenCropImageModal = false;
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.thumbnailImage = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'thumbnail-image');
        formData.append('images', this.imageUrl); // this.imageUrl is File
        this.fileUploadService.sendFile(formData).subscribe({
          next: (res) => {
            this.thumbnailImage = res.urls[0]
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

  /**Using for saved blog details */
  saveBlogDetails(){
    //console.log(this.uploadPdf);
    if(this.uploadPdf.length !== 0){
      this.uploadPdf.map((item:any)=>{
        this.uploadpdfs.push(item.url)
      })
    }
    const communtityId = this.storageService.getLocalStorageItem('communtityId');
    const saveData = this.blogForm.value;
    const params:any={};
    if(this.thumbnailImage === null || this.thumbnailImage === '' || this.thumbnailImage === undefined){
      this.alertService.error("Please upload thumbnail image");
      return;
    }
    // if(this.uploadedImages.length === 0){
    //   this.alertService.error("Please upload blog images");
    //   return;
    // }
    // if(this.uploadPdf.length === 0){
    //   this.alertService.error("Please upload pdfs");
    //   return;
    // }
    if((this.blogEditId === '' || this.blogEditId === null || this.blogEditId === undefined) && (saveData.eventId === '' || saveData.eventId === null || saveData.eventId === undefined)){
      this.alertService.error("Please select event");
      return;
    }
    params['data']={
      blogCategory: saveData.blogCategory,
      blogDescription: saveData.blogDescription,
      blogShortDesc: saveData.blogShortDesc,
      fbLink: saveData.fbLink ? saveData.fbLink : '',
      twitterLink: saveData.twitterLink ? saveData.twitterLink : '',
      likedinLink: saveData.likedinLink ? saveData.likedinLink : '',
      //blogStatus: true,
      blogTitle: saveData.blogTitle,
      image: this.uploadedImages,
      //image: this.mainImage ? this.mainImage : '',
      //paymentStatus: true,
      //pdf: this.pdfs ? this.pdfs : '',
      pdf: this.uploadpdfs,
      thumbnailImage: this.thumbnailImage ? this.thumbnailImage : ''
    }
    // console.log("params.....",params);
    // return;
    this.loaderService.show();
    if(this.blogEditId){
      params['data'].blogId = this.blogEditId;
      this.blogDeatilsSaveSubscriber = this.apolloClient.setModule('updateblogs').mutateData(params).subscribe({
        next:(response: GeneralResponse)=>{
          if(response.error){
            this.loaderService.hide();
            this.alertService.error(response.message);
          }
          else{
            this.loaderService.hide();
            this.alertService.error(response.message);
            this.router.navigateByUrl('/blog');
          }
        },
        error: err =>{
          console.log(err);        
        }
      })
    }
    else{
      params['data'].communityId = communtityId,
      params['data'].eventId = saveData.eventId,
      this.blogDeatilsSaveSubscriber = this.apolloClient.setModule('createBlogs').mutateData(params).subscribe({
        next:(response: GeneralResponse)=>{
          if(response.error){
            this.loaderService.hide();
            this.alertService.error(response.message);
          }
          else{
            this.loaderService.hide();
            this.alertService.error(response.message);
            this.router.navigateByUrl('/blog');
          }
        },
        error: err =>{
          console.log(err);        
        }
      })
    }
    this.loaderService.hide();
  }

  /**Using get blog details by id */
  getBlogDetails(){
    const params:any = {};
    if(this.blogId){
      params['data'] = {
        blogId: this.blogId
      }
    }
    else{
      params['data'] = {
        blogId: this.blogEditId
      }
    }
    this.loaderService.show();
    this.getBlogsSubscriber = this.apolloClient.setModule('getBolgsById').queryData(params).subscribe({
      next: (response:GeneralResponse) =>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.blogDetails = response.data;
          //console.log("pdf....",this.blogDetails.pdf);
          
          if(this.blogDetails.pdf.length > 0){
            this.blogDetails.pdf.map((item:any)=>{
            const startIndex = item.lastIndexOf('/') + 1; // Find the index of the last '/'
            const endIndex = item.indexOf('%20', startIndex); // Find the index of the first '%20' after the last '/'
            const filename = item.substring(startIndex, endIndex !== -1 ? endIndex : undefined);
            this.pdfFile.push({
              name: filename,
              url: item
            });
            })
          }
          this.blogForm.patchValue({
            blogTitle: this.blogDetails.blogTitle,
            blogCategory: this.blogDetails.blogCategory,
            blogDescription: this.blogDetails.blogDescription,
            blogShortDesc: this.blogDetails.blogShortDesc,
            fbLink: this.blogDetails.fbLink,
            twitterLink: this.blogDetails.twitterLink,
            likedinLink: this.blogDetails.likedinLink,
            eventId: this.blogDetails.eventId,
          });
          this.thumbnailImage = this.blogDetails.thumbnailImage ? this.blogDetails.thumbnailImage : '';
          this.uploadedImages = this.blogDetails.image ? this.blogDetails.image : [];
          this.uploadPdf = this.blogDetails.pdf ? this.pdfFile : '';
          const decodedFileName = decodeURIComponent(this.pdfs);
          const parts = decodedFileName.split(/[\\/]/);
          this.getPdfFile = parts[parts.length - 1];
          this.hasevent = true;
          this.totalImageCount = this.blogDetails.image.length ? this.blogDetails.image.length : 0;
          this.totalPdfCount = this.blogDetails.pdf.length ? this.blogDetails.pdf.length : 0;
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loaderService.hide();
  }


  //For event............
  getPublicEvent(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params:any = {};
    params['data'] = {
      communityId: community_id,
    }
    this.loaderService.show();
    // this.apolloClient.setModule('getMyCommunityEventsForBlog').queryData(params).subscribe((response: GeneralResponse) => {
      this.apolloClient.setModule('getMyCommunityEventsList').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      }
      else{
          this.evetList =  response.data.events;
          //console.log("eventList.......",this.evetList);
          
      }
    })
    this.loaderService.hide();
  }

  /**Selected the multiple images upload */
  onFileSelected(event: any, type: 'image' | 'pdf'): void {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      this.alertService.error("No files selected.");
      return;
    }
    const maxAllowed = 5;
    const allowedExtensions = type === 'image'
      ? ['.jpg', '.jpeg', '.png']
      : ['.pdf'];

    const currentList = type === 'image' ? this.uploadedImages : this.uploadPdf;
    const totalCount = currentList.length + selectedFiles.length;
    if (totalCount > maxAllowed) {
      this.alertService.error(`Maximum ${maxAllowed} ${type === 'image' ? 'images' : 'PDFs'} can be uploaded.`);
      return;
    }

    for (const file of Array.from(selectedFiles) as File[]) {
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        this.alertService.error(`Only ${allowedExtensions.join(', ')} files are allowed for ${type} upload.`);
        return;
      }
    }
    for (const file of Array.from(selectedFiles) as File[]) {
      this.saveGenericFile(type, file);
    }
    // Update counters
    if (type === 'image') {
      this.totalImageCount = this.uploadedImages.length + selectedFiles.length;
    } else {
      this.totalPdfCount = this.uploadPdf.length + selectedFiles.length;
    }
  }

  saveGenericFile(type: 'image' | 'pdf', file: File) {
  const formData = new FormData();
  formData.append('type', type === 'image' ? 'blog-images' : 'blog-pdfs');
  formData.append('images', file);

  this.fileUploadService.sendFile(formData).subscribe({
    next: (res) => {
      if (type === 'image') {
        this.uploadedImages.push(res.urls[0]);
      } else {
        this.uploadPdf.push({ url: res.urls[0], name: file.name });
      }
    },
    error: (err) => {
      console.error('Upload error:', err);
      this.alertService.error(`Upload failed for: ${file.name}`);
    }
  });
}



  /**Upload the blog images */
  async uploadImages(): Promise<void> {
    // if (this.selectedFiles && this.selectedFiles.length > 0) {
    //   const bucket = new S3({
    //     accessKeyId: environment.AWS_ACCESS_KEY,
    //     secretAccessKey: environment.AWS_SECRET_KEY,
    //     region: environment.AWS_REGION
    //     // region: 'ap-south-1' // Asia Pacific (Mumbai)
    //   });
  
    //   for (const file of this.selectedFiles) {
    //     const params = {
    //       Bucket: environment.BUCKET_NAME,
    //       Key: file.name, // Use the file name as the key
    //       Body: file,
    //       ACL: 'public-read'
    //     };
  
    //     try {
    //       const data = await bucket.upload(params).promise();
    //       this.alertService.success("Successfully uploaded");
    //       this.uploadedImages.push(data.Location);
    //       //console.log("uploadedImages....",this.uploadedImages);
          
    //     } catch (err) {
    //       console.error("Error uploading file", err);
    //       this.alertService.error("There was an error uploading your file");
    //     }
    //   }
    // } else {
    //   this.alertService.error("No file uploaded.");
    // }
  }

  /**Remove the blog images */
  uploadedImgDelete(url:any){
    const indeex = this.uploadedImages.indexOf(url);
    this.totalImageCount = this.uploadedImages ? this.uploadedImages.length - 1 : 0;
    this.uploadedImages.splice(indeex,1); 
  }

   /**Selected the multiple images upload */
   onFileSelectedPdf(event: any): void {
    this.selectedPdfs = event.target.files;
    if (this.selectedPdfs.length > 0) {
      const allowedExtensions = ['.pdf'];
      for (const file of Array.from(this.selectedPdfs)) {
        const extension = (file as File).name.substr((file as File).name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          this.alertService.error("Only .pdf file are allowed for upload.");
          return;
        }
      }
    } else {
      this.alertService.error("No files selected for upload.");
    }
    const pdfLength = this.selectedPdfs.length + this.uploadPdf.length;
    this.totalPdfCount = pdfLength;
    //console.log("len....",pdfLength)
    //this.uploadedImages = []; // Clear previous uploads when new files are selected
    if(pdfLength > 5){
      this.alertService.error("Maximum uploaded 5 pdf files!");
      return;
    }
    else{
      this.uploadPdfs();
    }
  }

  /**Upload the multiple pdfs */
  async uploadPdfs(): Promise<void> {
    if (this.selectedPdfs && this.selectedPdfs.length > 0) {
      const bucket = new S3({
        accessKeyId: environment.AWS_ACCESS_KEY,
        secretAccessKey: environment.AWS_SECRET_KEY,
        region: environment.AWS_REGION
        // region: 'ap-south-1' // Asia Pacific (Mumbai)
      });
  
      for (const file of this.selectedPdfs) {
        const params = {
          Bucket: environment.BUCKET_NAME,
          Key: file.name, // Use the file name as the key
          Body: file,
          ACL: 'public-read'
        };
        try {
          const data = await bucket.upload(params).promise();
          this.alertService.success("Successfully uploaded");
          this.uploadPdf.push({
            name: file.name,
            url: data.Location
          });
          
        } catch (err) {
          console.error("Error uploading pdf files", err);
          this.alertService.error("There was an error uploading your pdf files");
        }
      }
    } else {
      this.alertService.error("No file uploaded.");
    }
  }

  /**Remove the blog images */
  uploadedPdfDelete(url:any){
    const index = this.uploadPdf.findIndex((item:any) => item.url === url);
    this.totalPdfCount = this.uploadPdf ? this.uploadPdf.length - 1 : 0;
    this.uploadPdf.splice(index,1); 
  }
}

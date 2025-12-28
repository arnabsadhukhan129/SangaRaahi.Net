import { Component, OnInit } from '@angular/core';
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
import { WebpageComponent } from '../webpage/webpage.component';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { log } from 'console';
import * as FileSaver from 'file-saver';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
declare var window:any;
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  changeText!:boolean;
  paymentForm!: FormGroup
  imageSrc!: any;
  QRImage: any;
  bankcheckImage: any;
  paymentDetails: any;
  $modal: any;
  $modal1: any;
  $modal2: any;
  QRImageChangedEvent: any;
  bankImageChangedEvent: any;
  QRCroppedImage: any;
  bankCroppedImage: any;
  QROpenCropImageModal: boolean= false;
  bankOpenCropImageModal: boolean= false;
  getFileName: any;
  confirm:boolean = false;
  bankImageName!: string;
  hasChecked: boolean = false;
  checkFlag: boolean = true;
  disable:boolean = false;
  termsBoolean: boolean = false;
  privacyBoolean: boolean = false;
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
    private webpageComponent : WebpageComponent,
    private fileUploadService: FileUploadService
  ){}
  ngOnInit(): void {
    this.initForm();
    this.getCommunityPayments();
    //this.checkIfDirty();
  }

  initForm(){
    this.paymentForm = this.builder.group({
      paymentDescription: [''],
      authorityName: [''],
      otherpaymentLink: [''],
      link:[''],
     // isCheck:['',[this.validator.isEmpty]]
    })
    this.paymentForm.controls['paymentDescription']
  }



previewImage(event: any, imageName: string) {
  const file: File = event.target.files[0];
  if (!file) return;
  const size = file.size / 1024;
  if (size > 5120) {
    this.alertService.error("Size shouldn't be greater than 5 MB.");
    return;
  }
  const fileType = file.type;
  const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
 if (imageName === 'qrcodeImage') {
    if (!allowedImageTypes.includes(fileType)) {
      this.alertService.error("Only PNG, JPG, or JPEG images are allowed for QR Code.");
      return;
    }
    // Read image for preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      this.imageSrc = e.target?.result;
      this.saveImage(imageName, file);
    };
  } else {
    // For other uploads (e.g. PDF, DOC), skip preview and directly upload
    this.imageSrc = null;
    this.saveImage(imageName, file);
  }

  this.getFileName = file.name;
}



  uploadFileToS3Bucket(fileName: any,imageName: any) {
    const file = fileName.target.files[0] ? fileName.target.files[0] : '';
    const files = fileName.target.files ? fileName.target.files : '';
    const extension = file.name.substr(file.name.lastIndexOf('.'));
    //console.log("extension.......",extension);
    if(imageName === 'bankcheckImage'){
      if((extension.toLowerCase() === '.exe') || (extension.toLowerCase() === '.gif') || (extension.toLowerCase() === '.twbx')){
        this.alertService.error("Could not allow to upload .exe,.twbx,.gif files");
        return;
      }
    }
    if (file && files) {
      // console.log("file..........",file.name);
      // console.log("files..........",files);
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

        //console.log("params...........",params);
        
      bucket.upload(params,  (err: any, data: any) => {
        if (err) {
          this.alertService.error("There was an error uploading your file");
          return false;
        }
        else {
          //this.alertService.error("Successfully uploaded file.");
          if (imageName === 'qrcodeImage') {
            this.QRImage = data.Location;
          } else {
            this.alertService.error("Successfully uploaded" + ' ' +file.name + 'file');
            this.bankcheckImage = data.Location;  
            // console.log("this.bankcheckImage..........",this.bankcheckImage);
                     
            this.getFileName = file.name;
            // console.log("getFileName1.........",this.getFileName);
          }
          return true;
        }
      });
    }else {
      this.alertService.error("No file uploaded.");
    }
  }

  save(value:any){
    const URLregex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    if(this.paymentForm.value.link != ''){
      if(!this.paymentForm.value.link.match(URLregex)){
        this.alertService.error("Invalid payment link");
        return;
      }
    }
    const params: any = {};
    params['data'] = {
      qrcodeImage: this.QRImage,
      bankcheckImage: this.bankcheckImage,
      bankcheckImageName : this.getFileName,
      paymentDescription: this.paymentForm.value.paymentDescription ?  this.paymentForm.value.paymentDescription : '',
      authorityName: this.paymentForm.value.authorityName ?  this.paymentForm.value.authorityName : '',
      otherpaymentLink: this.paymentForm.value.otherpaymentLink ?  this.paymentForm.value.otherpaymentLink : '',
      link: this.paymentForm.value.link ?  this.paymentForm.value.link : ''
    }
    this.loaderService.show();
    this.apolloClient.setModule("addOrUpdatepayment").mutateData(params).subscribe((response: any) => {
      if (response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
      else {
        this.loaderService.hide();
        this.alertService.error(response.message);
        if(value === 'next'){
          this.closeTermsModal();
          this.alertService.error("Payment saved successfully");
          this.webpageComponent.showAbout();
        }
        else if(value === 'previous'){
          //this.closeTermsModal();
          this.alertService.error("Payment saved successfully");
          this.webpageComponent.showVideo();
        }
        else{
          this.closeTermsModal();
          this.alertService.error("Payment saved successfully");
          this.router.navigateByUrl('community-management/profile-edit');
        }
      }
    });
  }

  getCommunityPayments(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        id: community_id,
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getCommunityPayments').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.paymentDetails = response.data;    
        this.getFileName = this.paymentDetails?.bankcheckImageName ;
        this.patchData(this.paymentDetails);
        this.QRImage = this.paymentDetails.qrcodeImage ? this.paymentDetails.qrcodeImage : '';
        this.bankcheckImage = this.paymentDetails.bankcheckImage ? this.paymentDetails.bankcheckImage : '';
        //console.log("paymentDetails.....",this.paymentDetails);
      }
      });
      //console.log("paymentDetails.....",this.paymentDetails);
      if(this.paymentDetails){
        //console.log("paymentDetails.....",this.paymentDetails);
        
        this.hasChecked = true;
      }
      else{
        this.hasChecked  = false;
      }
  }

  patchData(paymentDetails:any){
    this.paymentForm.patchValue({
      paymentDescription: paymentDetails.paymentDescription ? paymentDetails.paymentDescription : '',
      authorityName: paymentDetails.authorityName ? paymentDetails.authorityName : '',
      otherpaymentLink: paymentDetails.otherpaymentLink ? paymentDetails.otherpaymentLink : '',
      link: paymentDetails.link ? paymentDetails.link : '',
    });
  }

  cancel(){
    this.router.navigateByUrl('community-management/profile-edit')
  }

  undoSetting(){
    this.patchData(this.paymentDetails);
    this.QRImage = this.paymentDetails.qrcodeImage ? this.paymentDetails.qrcodeImage : '';
    this.bankcheckImage = this.paymentDetails.bankcheckImage ? this.paymentDetails.bankcheckImage : '';
    this.getFileName = this.paymentDetails.bankcheckImageName? this.paymentDetails.bankcheckImageName : '';
  }

  deleteQRImage(){
    this.QRImage = '';
  }
  
  deleteBankCheckImage(){
    this.bankcheckImage = '';
    this.getFileName = ''
  }

  showQRCode(){
    this.$modal1 = new window.bootstrap.Modal(
      document.getElementById("QRDetails")
    );
    this.$modal1.show();
  }

  showTerms(){
    this.termsBoolean = true;
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("termsModal")
    );
    this.$modal.show();
  }

  showPrivacy(){
    this.privacyBoolean = true;
    this.$modal2 = new window.bootstrap.Modal(
      document.getElementById("privacyModal")
    );
    this.$modal2.show();
  }

  saveImage(imageName: any, file: File) {
  const formData = new FormData();

  if (imageName === 'qrcodeImage') {
    this.QROpenCropImageModal = false;
    formData.append('type', 'payment-QR-image');
  } else {
    this.bankOpenCropImageModal = false;
    formData.append('type', 'payment-pdf'); // You can change the type if needed
  }

  formData.append('images', file); 

  for (let [key, value] of (formData as any).entries()) {
    console.log(`${key}:`, value);
  }

  this.fileUploadService.sendFile(formData).subscribe({
    next: (res) => {
      if (imageName === 'qrcodeImage') {
        this.QRImage = res.urls[0];
      } else {
        this.bankcheckImage = res.urls[0];
      }
    },
    error: (err) => {
      console.error('Upload error:', err);
    }
  });
}



  closeImage(imageName:any){
    if(imageName === 'qrcodeImage'){
      this.QROpenCropImageModal = false;
    }
    else{
      this.bankOpenCropImageModal = false;
    }
  }

  confirmCheck(){
    
    if(this.paymentForm.value?.paymentDescription || this.paymentForm.value?.authorityName || this.paymentForm.value?.otherpaymentLink || this.paymentForm?.value.link){
      //this.updateCheckBoxValue(true);
      return true;
    }
    else{
      //this.updateCheckBoxValue(false);
      return false;
    }
  }

  check(){
    return {'disabled': this.paymentForm.value?.isCheck === false}
  }

  downloadFile(){
    // console.log("this.getFileName.........",this.getFileName);
    // console.log("this.getFileName.......",this.getFileName);
    
    FileSaver.saveAs(this.bankcheckImage,this.getFileName)
  }

  // checkIfDirty(){
  //   this.paymentForm.valueChanges.subscribe(res=>{
  //     console.log("this.paymentForm.dirty ", this.paymentForm.dirty);
  //     if (this.paymentForm.dirty && this.paymentForm.value.isCheck !== false && this.checkFlag === true) {
  //         this.paymentForm.patchValue({isCheck: false});
  //         this.checkFlag = false;
  //       }
  //   })
  // }

  closePrivacyModal(){
    this.privacyBoolean = false; 
    this.$modal2.hide();
  }
  closeTermsModal(){
    this.termsBoolean = false;
    this.$modal.hide();
    //this.closePrivacyModal();
  }

  isCheck(event:any){
    if(event.target.checked === true){
      this.disable = true;
    }
    else{
      this.disable = false;
    }
  }

}

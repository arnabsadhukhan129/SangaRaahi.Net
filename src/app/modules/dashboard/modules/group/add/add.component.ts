import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { StorageService } from 'src/app/shared/services/storage.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { MatChipInputEvent } from '@angular/material/chips';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subscription } from 'rxjs';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})

export class AddGroupComponent implements OnInit, OnDestroy{
  @ViewChild('memberInput') memberInput!: ElementRef<HTMLInputElement>;
  removeGroupSubscriber!: Subscription;
  
  announcer = inject(LiveAnnouncer);
  groupForm!: FormGroup;
  groupImage: string = '';
  groupId!: any;
  getMemberData: any = [];
  openCropImageModal: boolean= false;
  imageChangedEvent: any;
  getFileName: any;
  croppedImage: any;
  members: any = [];
  memberCtrl= new FormControl([]);
  memberDataArray:any = [];
  separatorKeysCodes1: number[] = [ENTER, COMMA];
  getMemberIndex!: number;
  imageUrl: any;

  constructor(
                private alertService: AlertService,
                private sharedService: SharedService,
                private loaderService: LoaderService,
                private apolloClient: ApolloClientService,
                private router: Router,
                private activatedRoute : ActivatedRoute,
                private storageService: StorageService,
                private validator: ValidatorService,
                private fileUploadService: FileUploadService
            )
  {

  }

  ngOnInit() : void
  { 
        this.generateForm();
        this.getMemberList();
        this.activatedRoute.paramMap.subscribe(params => {
          this.groupId = params.get('id'); 
        });
        
        
  }

  ngOnDestroy(): void {
    if(this.removeGroupSubscriber){
      this.removeGroupSubscriber.unsubscribe()
    }
  }

  generateForm()
  {
        this.groupForm = new FormGroup({
            name : new FormControl('', [Validators.required, this.validator.nameIsLong]),
            description : new FormControl(''),
            image : new FormControl(''),
            type : new FormControl('', [Validators.required]),
            memberCtrl: new FormControl([])
           
        });
  }

  getgroupDetails()
  {
    const params:any= {};
    params['getMyCommunityGroupByIdId'] = this.groupId;
    let groupData : any = {};

    this.loaderService.show();

    this.apolloClient.setModule('getMyCommunityGroupByID').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {

        groupData = response.data;

        //console.log('groupData', groupData);

        this.groupForm.patchValue({
          name: groupData.name ? groupData.name : '',
          description: groupData.description ? groupData.description : '',
          type: groupData.type ? groupData.type : ''
        });

        this.groupImage = groupData?.image;
        groupData.members.map((element: any, index:number) => {
          //console.log("element....",element);
          
          this.selectedMembers(element);
          this.getmemberIndex(element.memberId);
          return {
            member: {
              members: {
                user: {
                  "phone": element?.phone,
                  "name": element?.name,
                }
              }
            }
          };
        });
        //this.alertService.success(response.message);
      }
    });

  }

    getmemberIndex(memberId:any){
      //console.log("getMemberData......",this.getMemberData);
      
      this.getMemberIndex = this.getMemberData.findIndex((val:any)=> val?.members?.user?.id === memberId);
      //console.log("getMemberIndex...",this.getMemberIndex);
      
      this.isMemberOptionDisabled(this.getMemberIndex);
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

      // this.sharedService.uploadFileToS3Bucket(event, imageName,
      //   (err : any, data : any, imageName: any) => {
      //     this.setS3BucketUploadedFilePath(err, data, imageName);
      //   });
    }

  /*
    setS3BucketUploadedFilePath (err : any, data : any, imageName : any) {
    
      if (err) {
              this.alertService.error("There was an error uploading your file");
              return false;
      } else {
            if (imageName === 'image') {
              this.groupImage = data.Location;         
              this.alertService.error("Image has been uploaded successfully");
            }
            return true;
      }
  }
  */

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
    this.groupImage = '';
  }

  saveImage(){
    this.openCropImageModal = false;
    // this.sharedService.uploadCropedFileToS3Bucket(this.croppedImage, this.getFileName, 'groupImage',
    //   (err : any, data : any, imageType: string) => {
    //     this.setS3BucketUploadedFilePath(err, data);
    //   });
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
      this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
        this.groupImage = base64; // only for preview
        const formData = new FormData();
        formData.append('type', 'community-profile-image');
        formData.append('images', this.imageUrl); // this.imageUrl is File
        // for (const [key, value] of (formData as any).entries()) {
        //   console.log(`formData key = ${key}`, value);
        // }
        // console.log("formData=====",formData);
        
        this.fileUploadService.sendFile(formData).subscribe({
          next: (res) => {
            // console.log('Upload success:', res);
            this.groupImage = res.urls[0]
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
      
            this.groupImage = data.Location;         
            this.alertService.error("Image has been uploaded successfully");
      
          return true;
    }
  }


  saveData()
  {
  if(this.memberDataArray.length === 0){
      this.alertService.error("Member is required");
      return;
    }
    const params: any = {};
    params['data'] = {
      name: this.groupForm.value.name,
      description: this.groupForm.value.description,
      image: this.groupImage,
      type: this.groupForm.value.type,
      members: this.memberDataArray ? this.memberDataArray : [],
    }
        if(this.groupId)
        {
          params['updateMyCommunityGroupId'] =  this.groupId;

            this.loaderService.show();
                this.apolloClient.setModule("updateMyCommunityGroup").mutateData(params).subscribe((response: any) => {
                  if (response.error) {
                    this.loaderService.hide();
                    this.alertService.error(response.message)
                  }
                  else {
                    this.loaderService.hide();
                    this.alertService.error(response.message);
                    this.router.navigateByUrl('/groups');
                    
                  }
                });
        }
        else
        {
              this.loaderService.show();
              this.apolloClient.setModule("myCommunityCreateGroup").mutateData(params).subscribe((response: any) => {
                if (response.error) {
                  this.loaderService.hide();
                  this.alertService.error(response.message)
                }
                else {
                  this.loaderService.hide();
                  this.alertService.error(response.message);
                  this.router.navigateByUrl('/groups');
                }
              });
        }
    
    
  }

  cancel(){
    this.router.navigateByUrl('groups')
  }

  /**For member list */
  getMemberList(){
    const params= {
      data:{
        communityId: this.storageService.getLocalStorageItem('communtityId'),
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getMemberData = response.data?.members;
        if(this.groupId)
          {
            this.getgroupDetails();
          }
        //console.log("getMemberData.....",this.getMemberData);
      
        this.getMemberData.forEach((element:any,index:number) => {
        // console.log("element.....",element);
          if(element.members.memberId === this.storageService.getLocalStorageItem('userId')){
            element.isMemberDisabled = true;
          }
          else{
            element.isMemberDisabled = false;
          }
          
        });
      }
    });
  }

  addMember(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our member
    if (value) {
      this.members.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
    this.memberCtrl.setValue(null);
  }

  removeMember(member: string): void {
    const index = this.members.indexOf(member);
    if (index >= 0) {
      this.members.splice(index, 1);
      this.memberDataArray.splice(index,1);
      this.announcer.announce(`Removed ${member}`);
    }
  }

  isMemberOptionDisabled(index:number){
    if (this.getMemberData && this.getMemberData[index]) {
      this.getMemberData[index].isDisabled = true;
    }
    // this.getMemberData[index].isMemberDisabled = true;
  }

  selectedMember(event: MatAutocompleteSelectedEvent): void {
    this.memberDataArray.push(event.option.value);
    this.members.push(event.option.viewValue);
    this.memberInput.nativeElement.value = '';
    this.memberCtrl.setValue(null);
    //console.log("array....",this.memberDataArray);
  }

  selectedMembers(value:any): void {
    //console.log("value....",value);
    
    this.memberDataArray.push(value.memberId);
    //this.members.push(value.user.name)
    this.members.push(value.user.name+'('+ value.user.phone +')');
    //this.memberInput.nativeElement.value = '';
    this.memberCtrl.setValue(null);
    //console.log(this.memberDataArray);
  }

  // Add the trackMember function
  trackMember(index: number, member: any): any {
    return member; // or provide a unique identifier for tracking
  }

  cancelMember(memberData:any){
    //console.log("memberData....",this.getMemberData);
    const memberdata1 = memberData.split('(')[1];
    const memberdata2 = memberdata1.split(')')[0];
    this.getMemberData.map((value:any,index:number)=>{
      if(value?.members?.user?.phone === memberdata2){
        if(this.groupId && this.getMemberData[index].members.memberId === value.members.user.id){
          const params:any={};
            params['data']= {
              groupId: this.groupId,
              memberIds: [this.getMemberData[index].members.memberId],
            }
            this.removeGroupSubscriber = this.apolloClient.setModule('removeOrgGroupMember').mutateData(params).subscribe({
              next:(response: GeneralResponse)=>{
                if(response.error){
                  this.loaderService.hide();
                  this.alertService.error(response.message);
                  this.getMemberData[index].isMemberDisabled = true;
                }
                else{
                  this.loaderService.hide();
                  this.alertService.error(response.message);
                  this.getMemberData[index].isMemberDisabled = false;
                  this.removeMember(memberData);
                }
              },
              error: err =>{
                console.log(err);        
              }
            })  
        }
        else{
          this.getMemberData[index].isMemberDisabled = false;
          this.removeMember(memberData);
        }
      }
    })
  }

}

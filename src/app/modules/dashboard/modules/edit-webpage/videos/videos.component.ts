import { Component,OnInit,OnDestroy } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { CommonService } from '../../../services/common.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WebpageComponent } from '../webpage/webpage.component';

/* -- Drag & Drop -- Start -- */
// import {NgFor,NgIf} from '@angular/common';
import {
  // CdkDragDrop,
  // CdkDrag,
  // CdkDropList,
  // CdkDropListGroup,
  moveItemInArray,
  // transferArrayItem,
} from '@angular/cdk/drag-drop';
import { link } from 'fs';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
/* -- Drag & Drop -- end -- */

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],

  /* -- Drag & Drop -- Start -- */
  // standalone: true,
  // imports: [CdkDropListGroup, CdkDropList, NgFor,NgIf, CdkDrag],
  /* -- Drag & Drop -- End -- */

})
export class VideosComponent implements OnInit,OnDestroy {
  changeText!:boolean;
  thumb:any
  videos :any = [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ];
  videosDetails: any;
  // urlSafe: SafeResourceUrl | undefined;
  videoForm!: FormGroup;
  videoLink: any = '';
  URLDetails: any;
  currentIndex!: number;
  pastedDetails: any;
  hlink!: any;
  private getViddeoData!: Subscription;
  constructor(
    private builder: FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private commonService: CommonService,
    private validator: ValidatorService,
    private domSanitizer: DomSanitizer,
    private webpageComponent : WebpageComponent
  ) {  }

  ngOnInit(): void {
    this.initForm();
    this.getCommunityVideosDetails(); 
  }

  initForm() {
    //console.log("hiii");
    this.videoForm = this.builder.group({
      videoArray: this.builder.array([
        this.builder.group({
          id: [''],
          link: [''],
          title: [''],
          description: [''],
          thumbnailImage:[''],
          duration: [''],
          orderNo: [0]
        }),
      ]),     
    })

    for (let i of [0, 1, 2, 3, 4, 5]) {
      this.videoArray.push(
        this.builder.group({
          id: [''],
          link: [''],
          title: [''],
          description: [''],
          thumbnailImage:[''],
          duration: [''],
          orderNo: [i+1]
        }));
    }
  }

  get videoArray() : FormArray {
    return this.videoForm.get('videoArray') as FormArray;
  }


  patchData(URLDetails: any,index:number){
    this.videoArray.at(index).patchValue(URLDetails);
  }

  drop(event:any) {
    const temp = this.videosDetails[event.currentIndex];
    const prev = this.videosDetails[event.previousIndex];
    temp.orderNo = event.previousIndex;
    prev.orderNo = event.currentIndex;
    this.videoArray.at(event.currentIndex).patchValue(prev);
    this.videoArray.at(event.previousIndex).patchValue(temp);
    this.videosDetails[event.currentIndex] = prev;
    this.videosDetails[event.previousIndex] = temp;
  }

  reset(){
    this.pastedDetails = '';
  }

  cancel(){
    this.router.navigateByUrl('community-management/profile-edit')
  }

  save(value:any){
    const saveData = this.videoForm.value.videoArray;
    const sendData = saveData.filter((val:any) => val.link!='');
      const params: any = {};
      params['data'] = sendData;
      this.loaderService.show();
      //console.log("params....",params);
      
      this.apolloClient.setModule("addOrUpdateVideo").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message)
        }
        else {
          this.alertService.error("Video saved successfully");
          this.loaderService.hide();
          if(value === 'previous'){
            this.webpageComponent.showAnnouncement();
          }
          else if(value === 'next'){
            this.webpageComponent.showPayment();
          }
          else{
            this.router.navigateByUrl('community-management/profile-edit');
          }
        }
      });
    }

  getURLDetails(event: ClipboardEvent, index:number){
    console.log("index......",index);
    
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData?.getData('text');
    //console.log('Pasted: ', pastedText);
  const id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        link: pastedText
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getVideoDetails').queryData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if (response.error) {
        this.loaderService.hide();
        this.alertService.error("Video link can't be updated!");
      } else {
        this.URLDetails = response?.data;
        //console.log(this.URLDetails.link);
        
        // this.videosDetails[index].link = this.URLDetails.link;
        // this.videosDetails[index].thumbnailImage = this.URLDetails.link;
        // this.videosDetails[index].description = this.URLDetails.description;
        // this.videosDetails[index].title = this.URLDetails.title;
        // this.videosDetails[index].duration = this.URLDetails.duration;
        //console.log("URLDetails........",this.URLDetails);
        // if(this.videosDetails[index] && this.videosDetails[index].length > 0){
        //   this.videosDetails[index].link = this.URLDetails.link;
        //   this.videosDetails[index].thumbnailImage = this.URLDetails.link;
        //   this.videosDetails[index].description = this.URLDetails.description;
        //   this.videosDetails[index].title = this.URLDetails.title;
        //   this.videosDetails[index].duration = this.URLDetails.duration;
        //   //console.log(this.videoArray.at(index));
        // }
        // else{
        //   // console.log("value............",this.videoArray.at(index).value.id);
        //   if(this.videoArray.at(index).value.id === ''){
        //     this.videosDetails.push({
        //       link: this.URLDetails.link,
        //       thumbnailImage: this.URLDetails.link,
        //       description: this.URLDetails.description,
        //       title: this.URLDetails.title,
        //       duration: this.URLDetails.duration
        //     });
        //     //this.videoArray.removeAt(index);
        //     this.videoArray.at(index).patchValue({
        //       link: '',
        //       thumbnailImage: '',
        //       duration: ''
        //     });
        //     index = this.videosDetails.length - 1;
        //   }
        //   else{
        //     this.videosDetails[index].link = this.URLDetails.link;
        //     this.videosDetails[index].thumbnailImage = this.URLDetails.link;
        //     this.videosDetails[index].description = this.URLDetails.description;
        //     this.videosDetails[index].title = this.URLDetails.title;
        //     this.videosDetails[index].duration = this.URLDetails.duration;
        //   }
        // }
        // console.log("link.....",this.URLDetails.link);
        // console.log("id.....",this.videoArray.at(index).value.id);
        
        // if(this.videoArray.at(index).value.id){
        //   this.videosDetails[index].link = this.URLDetails.link;
        // }
        // else{
        //   this.videosDetails.push({
        //     link: this.URLDetails.link,
        //   })
        // }
        this.videoArray.at(index).patchValue({
          link: this.URLDetails.link,
          thumbnailImage: this.URLDetails.link,
          description: this.URLDetails.description,
          title: this.URLDetails.title,
          duration: this.URLDetails.duration
        });
        this.videosDetails.splice(index,1,{
          link: this.videoArray.at(index).value ? this.videoArray.at(index).value?.link : ''
        })
        //this.videosDetails[index].link =  this.videoArray.at(index).value ? this.videoArray.at(index).value?.link : '';
       // console.log(this.videosDetails[index].link);
        
        // this.videoLink = this.URLDetails.link;
        this.patchData(this.URLDetails,index);
      }
    });
}



  getCommunityVideosDetails() {
    const id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        id: id
      }
    }
    this.loaderService.show();
    this.getViddeoData  = this.apolloClient.setModule('getCommunityVideos')
    .queryData(params)
    .subscribe((response: GeneralResponse) => {
      if (response.error) {
        this.alertService.error(response.message);
      } else {
        this.videosDetails = response?.data;
        this.videosDetails.map((e:any, i:number)=> {          
          this.videoArray.at(i).patchValue(e);
        });
      }
    });
    
    
    this.loaderService.hide();
  }

  resetVideo(event:any,i:number){ 
    this.videoArray.at(i).patchValue({
      link: '',
      thumbnailImage: '',
      description:'',
      title:'',
      duration: '',
    });
    this.videosDetails[i].link = '';
    this.videosDetails[i].thumbnailImage = '';
    this.videosDetails[i].description = '';
    this.videosDetails[i].title = '';
    this.videosDetails[i].duration = '';
    if(this.videosDetails[i].id){
      const params = {
        data:{
          id:this.videosDetails[i].id
        }
      }
      this.loaderService.show();
      this.apolloClient.setModule("resetVideo").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.alertService.error(response.message)
        }
        else {
          this.alertService.error("Video reset successfully");
        }
      });
      this.loaderService.hide();
    }
    else{
      this.alertService.error("Video reset successfully");
    }
    // const params = {
    //   data:{
    //       id:this.videosDetails[i].id,
    //       link: null,
    //       thumbnailImage: null,
    //       description: null,
    //       title: null,
    //       duration: null,
    //       orderNo: this.videosDetails[i].orderNo
    //   }
    // }
    // this.loaderService.show();
    // this.apolloClient.setModule('addOrUpdateVideo').mutateData(params).subscribe((response: any) => {
    //   if (response.error) {
    //     this.alertService.error(response.message);
    //   } else {
    //       this.videoArray.at(i).patchValue({
    //         id: '',
    //         link: '',
    //         thumbnailImage: '',
    //         description:'',
    //         title:'',
    //         duration: '',
    //         orderNo: null
    //       });
    //       this.videosDetails[i].id = '';
    //       this.videosDetails[i].link = '';
    //       this.videosDetails[i].thumbnailImage = '';
    //       this.videosDetails[i].description = '';
    //       this.videosDetails[i].title = '';
    //       this.videosDetails[i].duration = '';
    //       this.videosDetails[i].orderNo = null;
    //     };
    // });
    // this.loaderService.hide();
   
  }

  getVideoLink(i:number): string{
    return this.videosDetails && this.videosDetails[i] && this.videosDetails[i].link ? this.videosDetails[i]?.link   : '';
  }

  ngOnDestroy(){
    if(this.getViddeoData){
      this.getViddeoData.unsubscribe();
    }
    
  }
}





/* -- Drag & Drop -- Start -- */
export class CdkDragDropConnectedSortingGroupExample {

}
/* -- Drag & Drop -- end -- */

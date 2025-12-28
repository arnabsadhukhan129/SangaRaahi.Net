import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveMemberList } from 'src/app/shared/typedefs/custom.types';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { paramService } from 'src/app/shared/params/params';
import { CommonService } from '../../../services/common.service';
declare var window:any;
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit,OnDestroy {
  feedbacks!:any;
  current: number = 1;
  total!: number;
  from!: number;
  to!: number;
  totalData!:number;
  $modal: any;
  message: any;
  reciver!: string;
  communityEmail!: any;
  seachFilter:boolean = false;
  toggleFilter:boolean = false;
  searchForm!: FormGroup;
  mailForm!:FormGroup;
  emailId!: string;
  emailIndex!: number;
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private paramService: paramService,
    private commonService: CommonService
  ){
    this.commonService.sendSearch("no search");
  }

  ngOnInit(): void {
    this.generateSearchForm();
    this.generateMailForm();
    this.getMessageList(this.current);
    this.getCommunityDetails();
  }

  ngOnDestroy(): void {
    this.getCommunityDetails();
  }

  generateSearchForm() {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
      status: new FormControl(''),
      feedbackStartDate: new FormControl(''),
      feedbackEndDate: new FormControl('')
    });
  }

  generateMailForm(){
    this.mailForm = new FormGroup({
      //to: new FormControl(''),
      subject: new FormControl(''),
      body: new FormControl('')
    })
  }

  getMessageList(page : Number){
    const searchData = this.activatedRoute.snapshot.paramMap.get("value") ? this.activatedRoute.snapshot.paramMap.get("value") : ''
    const params:any = {};
    params['data'] = {
      page: page
    }
    if(searchData){
      params['data'].search = searchData.trim();
    }
    if(this.searchForm.value.search && this.searchForm.value.search!=''){
      params['data'].search = this.searchForm.value.search.trim();
    }
    if(this.searchForm.value.feedbackStartDate!=''){
      if(this.searchForm.value.feedbackEndDate === '' || null){
        this.alertService.error("End date is missing");
        return;
      }
      if(this.datePipe.transform(this.searchForm.value.feedbackStartDate,'yyyy-MM-dd') === this.datePipe.transform(this.searchForm.value.feedbackEndDate,'yyyy-MM-dd')){
        this.alertService.error("Start date and end date are not same");
        return;
      }
      params['data'].feedbackStartDate = this.searchForm.value.feedbackStartDate;
      params['data'].feedbackEndDate = this.searchForm.value.feedbackEndDate;
     }
     if(this.searchForm.value.status && this.searchForm.value.status!=''){
      params['data'].status = this.searchForm.value.status;
     }
     this.loaderService.show();
     this.apolloClient.setModule('getAllCommunityFeedbacks').queryData(params).subscribe((response: GeneralResponse) => {
       if(response.error) {
         this.alertService.error(response.message);
         return;
       } 
       else {
        this.feedbacks = response.data?.communityfeedbacks;
        this.totalData = response.data.total;
        this.from = response.data?.from;
        this.to = response.data?.to;
        if(response.data.total !== 0) {
          this.total = Math.ceil(response.data.total / 10);
        }else {
          this.total = 0;
        }
       }
     });
     this.loaderService.hide();
   }

  onGoTo(page: number): void {
    this.current = page
    this.getMessageList(this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getMessageList(this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getMessageList(this.current);
  }

  back(){
    this.paramService.updatecurrentRoute('/dashboard');
    this.router.navigateByUrl('/dashboard');
  }

  sendMail(item:any,i:number){
    this.emailIndex = i;
    this.emailId = item.id;
    this.reciver = item.email;
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("sendReply")
    );
    this.$modal.show();  
  }

  sendReply(){
    const regex = /^[A-Za-z\s]{1,20}$/;
    if(this.mailForm.value.subject === '' || null){
      this.alertService.error("Subject is required");
      return;
    }
    if(this.mailForm.value.body === '' || null){
      this.alertService.error("Email body is required");
      return;
    }
    if(this.mailForm.value.subject !== '' || null){
      if(!this.mailForm.value.subject.match(regex)){
        this.alertService.error("Subject should be between maximum 15 to 20 characters");
        return;
      }
    }
    const comName = this.storageService.getLocalStorageItem('communityName');
    //console.log("comName....",comName);
    
    const params:any={};
    params['data'] = {
      id: this.emailId,
      to: this.reciver ? this.reciver : '',
      subject: this.mailForm.value.subject ? comName +'-'+ this.mailForm.value.subject : '',
      body: this.mailForm.value.body ? '<b>Community Name:-</b>'+ ' ' + comName+'<br/> <b>Sender:-</b>'+' '+ this.communityEmail + '<br/><br/>'+ this.mailForm.value.body : '',
    }
    this.loaderService.show();
    this.apolloClient.setModule("communityReplyFeedback").mutateData(params).subscribe((response:any) => {
        if(response.error){
          this.alertService.error(response.message)
        }
        else{
          this.alertService.error("Reply Send Successfully");
          //this.$modal.hide();
          if(this.feedbacks[this.emailIndex].messageStatus === 'Viewed'){
            this.feedbacks[this.emailIndex].messageStatus = this.feedbacks[this.emailIndex].messageStatus === 'Viewed' ? 'Replied' :'Viewed';
            return;
          }
          else if(this.feedbacks[this.emailIndex].messageStatus === 'NotViewed'){
            this.feedbacks[this.emailIndex].messageStatus = this.feedbacks[this.emailIndex].messageStatus === 'NotViewed' ? 'Replied' :'VieNotViewedwed';
            return;
          }
          else{
            this.feedbacks[this.emailIndex].messageStatus = 'Replied';
          }
        }
      });
      this.closeModal()
      this.loaderService.hide();
  }

  closeModal(){
    this.mailForm.controls['subject'].setValue('');
    this.mailForm.controls['body'].setValue('');
    this.$modal.hide();
  }

  showMessage(item:any,i:number){
    const params:any= {};
    params['data'] = {
      id: item.id
    }
    if(this.feedbacks[i].messageStatus === 'Replied'){
      this.message = item.message;
      this.$modal = new window.bootstrap.Modal(
        document.getElementById("messageDetails")
      );
      this.$modal.show();
    }
    else{
      this.apolloClient.setModule('viewedFeedbackStatus').mutateData(params).subscribe((response: any) => {
        if(response.error) {
          this.alertService.error(response.message);
        } else {
          this.message = item.message;
          this.$modal = new window.bootstrap.Modal(
            document.getElementById("messageDetails")
          );
          this.$modal.show();
          this.feedbacks[i].messageStatus = this.feedbacks[i].messageStatus === 'NotViewed' ? 'Viewed' :'Viewed';
        }
      })
    }
  }

  getCommunityDetails(){
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunitiesView').queryData().subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.communityEmail = response.data.myCommunities.communityEmail;
        //console.log(this.communityEmail);
        
      }
    });
  }

  toggleSearch(){
    if( this.seachFilter === false){
      this.clearDateFilter()
      this.toggleFilter = false;
      this.seachFilter = true;
    }
    else{
      this.seachFilter = false;
    }
  }

  toggle(){
    if( this.toggleFilter === false){
      this.clearDateFilter();
      this.seachFilter = false;
      this.toggleFilter = true;
    }
    else{
      this.toggleFilter = false;
    }
  }

  clearDateFilter() {
    this.searchForm.controls['search'].setValue('');
    this.searchForm.controls['feedbackStartDate'].setValue('');
    this.searchForm.controls['feedbackEndDate'].setValue('');
    this.searchForm.controls['status'].setValue('');
    this.getMessageList(1);
  }
 
}

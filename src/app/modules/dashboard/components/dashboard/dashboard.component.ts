import { Component, DoCheck, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { communities } from 'src/app/shared/typedefs/custom.types';
import { CommunityService } from 'src/app/shared/services/community.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../services/common.service';
import { paramService } from 'src/app/shared/params/params';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscribable, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import {PaymentService} from 'src/app/shared/services/payment.service';
import { HttpResponse } from '@angular/common/http';

declare var window:any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,OnChanges,DoCheck,OnDestroy {
  private creditSubscriber!: Subscription;
  dashboardSubscription!: Subscription;
  switchList!: Subscription;
  $modal: any;
  $chooseModal: any;
  communities!: Array<communities>;
  communityId!:any;
  communityName:any;
  comName!: string;
  getCommunitiesCount: any;
  getAnnouncement: any;
  getEvent: any;
  announcementTitle!:string;
  announcementDesc: any;
  eventTitle!:string;
  eventType!:string;
  eventCreateDate!:string;
  eventEndDate!:string;
  eventDescription!:string;
  communityRole!:string;
  smsCredit!: any;
  emailCredit!: any;
  $stripeModal!: any;
  stripeOnboardForm!:FormGroup;
  stripeSubscription!: Subscription;
  stripeDetails!: any;
  getRole!: any;
  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private communityService: CommunityService,
    private StorageService: StorageService,
    private commonService: CommonService,
    private paramService: paramService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paymentService: PaymentService
  ){
    this.commonService.sendSearch("no search");
  }

  ngOnInit(): void {
    this.getRole = this.StorageService.getLocalStorageItem('role');
    // console.log("getRole======",this.getRole);
    
    this.communitityList();
    if(this.StorageService.getLocalStorageItem('communtityId')){
      this.getmyCommunityDashboardList1();
      this.getAllCommunitiesSmsEmailCredit()
    }
    this.generateMailForm();
    this.getStripeDetails();
    // this.commonService.getSearchData().subscribe((val)=> {
    //   console.log("val....",val);
    //   // if(val!= ""){
    //   //    this.commonService.sendSearch(null);
    //   // }
    //   if(val === null || val === "" || val === undefined){
    //     this.commonService.sendSearch("no search value");
    //   }
    // })
    // this.getAllCommunitiesSmsEmailCredit();
    // this.getmyCommunityDashboardList(this.StorageService.getLocalStorageItem('communtityId'));
    // this.commonService.getValue().subscribe((comId)=>{
    //   this.getmyCommunityDashboardList(comId);
    // })
  }

  generateMailForm(){
    this.stripeOnboardForm = new FormGroup({
      email: new FormControl('')
    })
  }
  
  ngDoCheck(){
    this.getRole = this.StorageService.getLocalStorageItem('role');
    // this.getmyCommunityDashboardList(this.StorageService.getLocalStorageItem('communtityId'))
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRole = this.StorageService.getLocalStorageItem('role');
   // this.communitityList();
  }

  ngOnDestroy(): void {
    if(this.dashboardSubscription){
      this.dashboardSubscription.unsubscribe();
    }
    if(this.switchList){
      this.switchList.unsubscribe();
    }
    if(this.creditSubscriber){
      this.creditSubscriber.unsubscribe();
    }
    if(this.stripeSubscription){
      this.stripeSubscription.unsubscribe();
    }
  }

  
  openCommunityModal(){
    this.loaderService.show();
    // this.communitityList();
    // setTimeout(() => {
     if(this.communities?.length === 1){
       this.StorageService.setLocalStorageItem('communtityId',this.StorageService.getLocalStorageItem('communtityId'));
       this.communityService.switchCommunity(this.communityId);
       this.commonService.sendValue(this.StorageService.getLocalStorageItem('communtityId'));
       this.commonService.sendImage(this.communities[0].logoImage ? this.communities[0].logoImage : 'assets/images/event-activity-01.jpg');
       this.StorageService.setLocalStorageItem('role',this.communities[0].role);
      //window.location.reload();
     }
     else if(!this.communities?.length){
       this.authService.logout();
     }
     else {
      this.$modal = new window.bootstrap.Modal(
        document.getElementById("chooseCommunitity")
      );
      if (!this.StorageService.getLocalStorageItem('communtityId')) {
        this.$modal.show();
      }
    }
     this.loaderService.hide();
    // }, 2000);
   }

   

   closeModal(id: any, logoImage: any) {
    this.$modal.hide();
    this.switchingCommunity(id, logoImage);
  }

  switchingCommunity(id:any,logoImage:any){
    this.communityService.switchCommunity(id);
    this.commonService.sendValue(id);
    this.commonService.sendImage(logoImage);
  }

  getStripeDetails(){
    this.loaderService.show();
    this.stripeSubscription = this.apolloClient.setModule('communityStripeDetails').queryData().subscribe((response: GeneralResponse) => {
      this.stripeDetails = response?.data;
    })
    this.loaderService.hide();
  }

  gotoDashboard(){
    const url = this.stripeDetails?.stripeAccountDashboard;
    if (url) {
      window.open(url, '_blank');
    }
  }

  communitityList(){
    // this.loaderService.show();
    this.switchList = this.apolloClient.setModule('switchOrganizationList').queryData().subscribe((response: GeneralResponse) => {
      // this.loaderService.hide();
      this.communities = response.data;
      this.communityId =  this.communities[0].id;
      this.openCommunityModal();
      if(this.StorageService.getLocalStorageItem('communtityId')){
        this.getmyCommunityDashboardList();
        this.getAllCommunitiesSmsEmailCredit1()
      }else{
        this.getmyCommunityDashboardList1();
        this.getAllCommunitiesSmsEmailCredit();
      }
      this.commonService.getValue().subscribe((element) => {
        const cname = this.communities.filter((val)=> val.id === element);
        this.communityName = cname[0]?.communityName;
        this.communityRole = cname[0]?.role;
        if(this.communityName !== undefined || null){
          this.StorageService.setLocalStorageItem('communityName',this.communityName);
          this.StorageService.setLocalStorageItem('role',this.communityRole);
        }
        this.communityName = this.StorageService.getLocalStorageItem('communityName');
      });
     });
   }

   getmyCommunityDashboardList1(){
    this.loaderService.show();
    this.commonService.getData().subscribe((response:any)=>{
      this.getCommunitiesCount = response?.data?.myCommunitieDasboard;
        this.getAnnouncement = response?.data?.announcements;
        this.getEvent = response?.data?.events;
    })
    
    this.loaderService.hide();
   }

   getmyCommunityDashboardList(){
    //console.log("communityId1111......",comId);
    const params:any = {}
      params['data'] = {
        // id: comId ? comId : this.StorageService.getLocalStorageItem('communtityId')
        id: this.StorageService.getLocalStorageItem('communtityId')
      }
    this.loaderService.show();
    this.dashboardSubscription = this.apolloClient.setModule('getmyCommunityDashboardList').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response?.error) {
        this.alertService.error(response.message);
      } else {
        this.getCommunitiesCount = response?.data?.myCommunitieDasboard;
        this.getAnnouncement = response?.data?.announcements;
        this.getEvent = response?.data?.events;
      }
    });
  }

  showDescription(title: any,desc:any) {
    this.announcementTitle = title ? title : 'N/A';
    this.announcementDesc = desc ? desc : 'N/A';
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("announcementDescription")
    );
    this.$modal.show();
  }

  viewAnnouncements(){
    this.paramService.updatecurrentRoute('/announcements');
    this.router.navigateByUrl('/announcements');
  }

  viewEvents(){
    this.paramService.updatecurrentRoute('/events');
    this.router.navigateByUrl('/events');
  }

  getDay(dayValue :any){
    let dateNew = dayValue, ordinal = 'th';
    if (dateNew == 2 || dateNew == 22) ordinal = 'nd';
    if (dateNew == 3 || dateNew == 23) ordinal = 'rd';
    if (dateNew == 21 || dateNew == 1 || dateNew == 31) ordinal = 'st';
    return dateNew + ' ' +ordinal;
  }

  showEvent(item:any){
    //console.log("item.......",item);
    this.eventTitle = item?.title;
    this.eventDescription = item?.description;
    this.eventType = item?.type;
    this.eventCreateDate = item?.date.to;
    this.eventEndDate = item?.date.from;
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("eventDetails")
    );
    this.$modal.show();
  }

  getAllCommunitiesSmsEmailCredit(){
    this.loaderService.show();
    this.commonService.getCredit().subscribe((response:any)=>{
      this.smsCredit = response?.data?.smsCreditsRemaining;
      this.emailCredit = response?.data?.emailCreditsRemaining;
    })
    this.loaderService.hide();
  }

  getAllCommunitiesSmsEmailCredit1(){
    const params={
      getCommunitiesSmsEmailCreditByIdId : this.StorageService.getLocalStorageItem('communtityId')
    }
    this.loaderService.show();
    this.creditSubscriber = this.apolloClient.setModule('getCommunitiesSmsEmailCreditById').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.smsCredit = response?.data?.smsCreditsRemaining;
           this.emailCredit = response?.data?.emailCreditsRemaining;
          
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loaderService.hide();
  }

  openStripeModal(){
    this.$stripeModal = new window.bootstrap.Modal(
      document.getElementById("senEmailForOnboard")
    );
    this.$stripeModal.show();
  }

  closeStripeModal(){
    this.$stripeModal.hide();
  }

  sendEmailForOnboard(){
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const email = this.stripeOnboardForm.value.email;
    if(email === '' || null){
      this.alertService.error("Email is required!");
      return;
    }
    if(email !== '' || null){
      if(!email.match(regex)){
        this.alertService.error("Incorrect Email!");
        return;
      }
    }

    const params = { email : email };
    this.loaderService.show();
    this.paymentService.paymentAccountCreatePost(params).subscribe({
        next: (response) => {
          this.alertService.error(response.message);
          // window.location.href = response.data;
          window.open(response.data, '_blank'); // Open in a new tab
          this.loaderService.hide();
        },
        error: (error) => {
          console.log(error,'errrr');
          
          this.loaderService.hide();
          this.alertService.error(error.error.message);
        }
      });
    this.closeStripeModal();
  }
}

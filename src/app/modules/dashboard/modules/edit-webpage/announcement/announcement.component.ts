import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OwlOptions } from 'ngx-owl-carousel-o';
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
declare var window:any;
@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  changeText1!: boolean;
  changeText2!: boolean;
  changeText3!: boolean;
  changeText4!: boolean;
  changeText5!: boolean;
  changeText6!: boolean;
  changeText7!: boolean;
  changeText8!: boolean;
  changeText9!: boolean;
  announcementForm!: FormGroup;
  announcmentDetails: any;
  memberAnnouncmentDetails: any;
  communityDetails: any;
  events: any;
  memberEvents: any;
  pastEvents: any
  $modal: any;
  desc: any;
  announcementTitle!:string
  eventTitle!:string;
  eventDescription!:string;
  eventAddress!:string;
  eventStartDate!:string;
  eventEndDate!:string;
  memberEvent: any;
  pastEvent: any;
  publicEvent: any;
  publicAnnouncement: boolean = false;
  memberAnnouncement: boolean = false;
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
    private webpageComponent : WebpageComponent
  ){}
  ngOnInit(): void {
    this.initForm();
    this.getCommunityDetals();
    this.getPublicAnnouncementDetails();
    this.getMemberAnnouncementDetails();
    this.getPastEvent();
    this.getPublicEvent();
    this.getMemberEvent();
  }

 

  initForm(){
    this.announcementForm = this.builder.group({
      publicAnnouncement: [''],
      memberAnnouncement: [''],
      pastEvent: [''],
      memberEvent:[''],
      publicEvent:['']
    })
  }

  //For public event............
  getPublicEvent(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params:any = {};
    params['data'] = {
      communityId: community_id,
      page: 1,
      eventType: "Public"
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      }
      else{
        if(this.announcementForm.value.publicEvent){
          this.events =  response.data.events;
        }
        else{
          this.events = [];
        }
      }
    })
    this.loaderService.hide();
  }

  togglePublicEvent(event:any){
    if (event.target.checked === true){
      this.getPublicEvent();
    }
    else{
      this.events = [];
    }
    this.publicEvent = event;
  }

  //For member event............
  getMemberEvent(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params:any = {};
    params['data'] = {
      communityId: community_id,
      page: 1,
      eventType: "Member"
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      }
      else{
        if(this.announcementForm.value.memberEvent){
          this.memberEvents =  response.data.events;
        }
        else{
          this.memberEvents = [];
        }
      }
    })
    this.loaderService.hide();
  }

  toggleMemberEvent(event:any){
    if (event.target.checked === true){
      this.getMemberEvent();
    }
    else{
      this.memberEvents = [];
    }
    this.memberEvent = event;
  }

   //For past event............
   getPastEvent(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params:any = {};
    params['data'] = {
      communityId: community_id,
      page: 1,
      eventType: "Past"
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      }
      else{
        if(this.announcementForm.value.pastEvent){
          this.pastEvents =  response.data.events;
        }
        else{
          this.pastEvents = [];
        }
      }
    })
    this.loaderService.hide();
  }

  togglePastEvent(event:any){
    if (event.target.checked === true){
      this.getPastEvent();
    }
    else{
      this.pastEvents = [];
    }
    this.pastEvent = event;
  }

  //For public announcement..........
  getPublicAnnouncementDetails(){
    //console.log(this.announcementForm.value.publicAnnouncement);
    
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        communityId: community_id,
        announcementType: "Public",
        isActive: "active"
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getAllAnnouncementOrganization').queryData(params).subscribe((response: GeneralResponse) => {
      //this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        if(this.announcementForm.value.publicAnnouncement){
          this.announcmentDetails = response.data.announcements;
        }
        else{
          this.announcmentDetails = [];
        }
      }
    });
    this.loaderService.hide();
  }

  togglePublicAnnouncement(event:any){
    if (event.target.checked === true){
      this.getPublicAnnouncementDetails();
    }
    else{
      this.announcmentDetails = [];
    }
    this.publicAnnouncement = event;
  }


  //For member announcement.............
  getMemberAnnouncementDetails(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        communityId: community_id,
        announcementType: "Member",
        isActive: "active"
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getAllAnnouncementOrganization').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        if(this.announcementForm.value.memberAnnouncement){
          this.memberAnnouncmentDetails = response.data.announcements;
        }
        else{
          this.memberAnnouncmentDetails = [];
        }
      }
    });
    this.loaderService.hide();
  }

  toggleMemberAnnouncement(event:any){
    if (event.target.checked === true){
      this.getMemberAnnouncementDetails();
    }
    else{
      this.memberAnnouncmentDetails = [];
    }

    this.memberAnnouncement = event;
  }

  getCommunityDetals(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        communityId: community_id,
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunitiesSettingsView').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.communityDetails = response.data.announcementSettings;
        this.patchData(this.communityDetails);
      }
      });
  }

  patchData(announcmentDetails:any){
    this.announcementForm.patchValue({
      publicAnnouncement: announcmentDetails.showPublicAnnouncement ? announcmentDetails.showPublicAnnouncement : '',
      memberAnnouncement: announcmentDetails.showMemberAnnouncement ? announcmentDetails.showMemberAnnouncement : '',
      pastEvent: announcmentDetails.showPastEvents ? announcmentDetails.showPastEvents : '',
      memberEvent: announcmentDetails.showMembersOnlyEvents ? announcmentDetails.showMembersOnlyEvents : '',
      publicEvent: announcmentDetails.showPublicEvents ? announcmentDetails.showPublicEvents : '',
    });
  }

  saveData(value:any){
    //console.log("value....",value);
    
    // console.log("showPublicAnnouncement1........",this.communityDetails.showPublicAnnouncement);
    // console.log("showPublicAnnouncement2........",this.announcementForm.value.publicAnnouncement);
    // if(this.communityDetails.showPublicAnnouncement !== this.announcementForm.value.publicAnnouncement || this.communityDetails.showMemberAnnouncement !== this.announcementForm.value.memberAnnouncement || this.communityDetails.showPastEvents !== this.announcementForm.value.pastEvent || this.communityDetails.showMembersOnlyEvents !== this.announcementForm.value.memberEvent || this.communityDetails.showPublicEvents !== this.announcementForm.value.publicEvent){
    //   this.alertService.error("are You want to save this page");
    // }
    const params:any={};
    params['data']={
      id: this.storageService.getLocalStorageItem('communtityId'),
      showPublicAnnouncement: this.announcementForm.value.publicAnnouncement ? this.announcementForm.value.publicAnnouncement : false,
      showMemberAnnouncement: this.announcementForm.value.memberAnnouncement ? this.announcementForm.value.memberAnnouncement : false,
      showPastEvents: this.announcementForm.value.pastEvent ? this.announcementForm.value.pastEvent : false,
      showMembersOnlyEvents: this.announcementForm.value.memberEvent ? this.announcementForm.value.memberEvent : false,
      showPublicEvents: this.announcementForm.value.publicEvent ? this.announcementForm.value.publicEvent : false,
    }
    this.loaderService.show();
    this.apolloClient.setModule("updateCommunityAnnouncementSettings").mutateData(params).subscribe((response:any) => {
    this.loaderService.hide();
      if(response.error){
        this.alertService.error(response.message)
      }
      else{
        this.alertService.error("Announcement data saved successfully");
        if(value === 'next'){
          this.webpageComponent.showVideo();
        }
        else if(value === 'previous'){
          this.webpageComponent.showHome();
        }
        else{
            this.router.navigateByUrl('community-management/profile-edit');
        }
      }
    });
  }

  cancel(){
    this.router.navigateByUrl('community-management/profile-edit');
  }

  previousSetting(){
    this.patchData(this.communityDetails);
    this.getPublicAnnouncementDetails();
    this.getMemberAnnouncementDetails();
    this.getPastEvent();
    this.getPublicEvent();
    this.getMemberEvent();
    // this.toggleMemberEvent(this.memberEvent);
    // this.togglePastEvent(this.pastEvent);
    // this.togglePublicEvent(this.publicEvent);
    // this.toggleMemberAnnouncement(this.memberAnnouncement);
    // this.togglePublicAnnouncement(this.publicAnnouncement);
  }

  showDescription(item:any){
    this.announcementTitle = item.title;
    this.desc = item.description;
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("announcementDesc")
    );
    this.$modal.show();
  }

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

  /* -- Owl carousel -- script -- start --*/
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    //dots: true,
    navSpeed: 700,
    margin:30,
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

}

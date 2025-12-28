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
import { OwlOptions } from 'ngx-owl-carousel-o';
import { paramService } from 'src/app/shared/params/params';
//import { ListComponent } from '../../active-members/list/list.component';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  changeText!:boolean;
  changeText1!:boolean;
  changeText2!:boolean;
  changeText3!:boolean;
  getDetails: any;
  getMemberRole: any;
  getExecutiveMember: any;
  exeMember!: string;
  boaMember!: string;
  aboutForm!: FormGroup;
  communityAboutDetails: any;
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
    private paramService:paramService
    //private listComponent : ListComponent
  ){}
  ngOnInit(): void {
    this.initForm();
    this.getCommunityBasicDetails();
    this.getBoardMemberRole();
    this.getExecutiveMemberRole();
  }

  initForm(){
    this.aboutForm = this.builder.group({
      showOrganizationDescription: [false],
      communityType: [''],
      nonProfit: [false],
      showOrganizationAddress: [false],
      showContactEmailPublicly: [false],
      showContactPhonePublicly: [false],
      showBoardMembers: [false],
      boardMembersLabelName: [''],
      showExecutiveMembers: [false],
      executiveMembersLabelName: ['']
    })
  }

  saveData(value: string){
    const params:any={};
    params['data']={
      id: this.storageService.getLocalStorageItem('communtityId'),
      showOrganizationDescription: this.aboutForm.value.showOrganizationDescription ? this.aboutForm.value.showOrganizationDescription : false,
      communityType: this.aboutForm.value.communityType ? this.aboutForm.value.communityType : '',
      nonProfit: this.aboutForm.value.nonProfit ? this.aboutForm.value.nonProfit : false,
      showOrganizationAddress: this.aboutForm.value.showOrganizationAddress ? this.aboutForm.value.showOrganizationAddress : false,
      showContactEmailPublicly: this.aboutForm.value.showContactEmailPublicly ? this.aboutForm.value.showContactEmailPublicly : false,
      showContactPhonePublicly: this.aboutForm.value.showContactPhonePublicly ? this.aboutForm.value.showContactPhonePublicly : false,
      showBoardMembers: this.aboutForm.value.showBoardMembers ? this.aboutForm.value.showBoardMembers : false,
      boardMembersLabelName: this.aboutForm.value.boardMembersLabelName ? this.aboutForm.value.boardMembersLabelName : '',
      showExecutiveMembers: this.aboutForm.value.showExecutiveMembers ? this.aboutForm.value.showExecutiveMembers : false,
      executiveMembersLabelName: this.aboutForm.value.executiveMembersLabelName ? this.aboutForm.value.executiveMembersLabelName : '',
      
    }
    this.loaderService.show();
    this.apolloClient.setModule("updateCommunityAboutUsSettings").mutateData(params).subscribe((response:any) => {
    this.loaderService.hide();
      if(response.error){
        this.alertService.error(response.message)
      }
      else{
        this.alertService.error("About saved successfully");
        if(value === 'previous'){
          this.webpageComponent.showPayment();
        }
        else{
          this.router.navigateByUrl('community-management/profile-edit');
        }
      }
    });
  }

  getCommunityBasicDetails(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        id: community_id,
        keyNames:["description", "address","email","phone"]
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getCommunityBasicDetails').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getDetails = response.data;
        this.getCommunityDetals(this.getDetails);
      }
      this.loaderService.hide();
      });
  }

  getCommunityDetals(getDetails: any){
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
        this.communityAboutDetails = response.data.aboutUsSettings;
        this.patchData(this.communityAboutDetails, getDetails);
      }
      });
  }

  patchData(getBasicDetails:any, getData:any){
    this.aboutForm.patchValue({
      showOrganizationDescription: getBasicDetails.showOrganizationDescription ? getBasicDetails.showOrganizationDescription : false,
      communityType: getData.communityType ? getData.communityType : '',
      nonProfit: getData.nonProfit ? getData.nonProfit : false,
      showOrganizationAddress: getBasicDetails.showOrganizationAddress ? getBasicDetails.showOrganizationAddress : false,
      showContactEmailPublicly: getBasicDetails.showContactEmailPublicly ? getBasicDetails.showContactEmailPublicly : false,
      showContactPhonePublicly: getBasicDetails.showContactPhonePublicly ? getBasicDetails.showContactPhonePublicly : false,
      showBoardMembers: getBasicDetails.showBoardMembers ? getBasicDetails.showBoardMembers : false,
      showExecutiveMembers: getBasicDetails.showExecutiveMembers ? getBasicDetails.showExecutiveMembers : false,
      boardMembersLabelName: getBasicDetails.boardMembersLabelName ? getBasicDetails.boardMembersLabelName : '',
      executiveMembersLabelName: getBasicDetails.executiveMembersLabelName ? getBasicDetails.executiveMembersLabelName : ''
    })
  }

  toggleshowBoardMembers(event:any){
    if (event.target.checked === true){
      this.communityAboutDetails.showBoardMembers = true;
      this.getBoardMemberRole();
    }
    else{
      this.communityAboutDetails.showBoardMembers = false;
      this.getMemberRole = []
    }
  }

  getBoardMemberRole(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        communityId: community_id,
        memberType:["board_member"]
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityMemberRoleFilter').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getMemberRole = response.data;    
        //console.log("getMemberRole....",this.getMemberRole);
      }
      this.loaderService.hide();
      });
  }

  toggleshowExecutiveMembers(event:any){
    if (event.target.checked === true){
      this.communityAboutDetails.showExecutiveMembers = true;
      this.getExecutiveMemberRole();
    }
    else{
      this.communityAboutDetails.showExecutiveMembers = false;
      this.getExecutiveMember = []
    }
  }

  getExecutiveMemberRole(){
    const community_id = this.storageService.getLocalStorageItem('communtityId');
    const params = {
      data: {
        communityId: community_id,
        memberType:["executive_member"]
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityMemberRoleFilter').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getExecutiveMember = response.data;    
        //console.log("getExecutiveMember....",this.getExecutiveMember);
      }
      this.loaderService.hide();
      });
  }

  viewAllBoardMembers(){
    this.paramService.updatecurrentRoute('/active-members/user-role/'+'board_member');
    this.router.navigateByUrl('/active-members/user-role/'+'board_member');
    //this.listComponent.getActiveMembersList(community_id,this.current);
  }

  viewAllExecutiveMembers(){
    this.paramService.updatecurrentRoute('/active-members/user-role/'+'executive_member');
    this.router.navigateByUrl('/active-members/user-role/'+'executive_member');
  }

  cancel(){
    this.paramService.updatecurrentRoute('/community-management/profile-edit');
    this.router.navigateByUrl('/community-management/profile-edit');
  }

  previousSetting(){
    this.getCommunityBasicDetails();
    this.getBoardMemberRole();
    this.getExecutiveMemberRole();
  }

  getInnerHTML(val:any){
    return val.replace(/(<([^>]+)>)/ig,'');
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
        items: 2
      },
      991: {
        items: 3
      },
      1024: {
        items: 4
      }
    },
    nav: true
  }
  /* -- Owl carousel -- script -- end --*/

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { LayoutComponent } from '../../../components/layout/layout.component';
@Component({
  selector: 'app-add-edit-permission',
  templateUrl: './add-edit-permission.component.html',
  styleUrls: ['./add-edit-permission.component.css']
})
export class AddEditPermissionComponent implements OnInit, OnDestroy {
  roleForm!: FormGroup;
  roleData: any;
  roleId: any;
  roleName: any;
  role_id: any;
  constructor(
                private builder : FormBuilder,
                private alertService: AlertService,
                private sharedService: SharedService,
                private loaderService: LoaderService,
                private apolloClient: ApolloClientService,
                private router: Router,
                private activatedRoute : ActivatedRoute,
                private storageService: StorageService,
                private validator: ValidatorService,
                private layoutComponent: LayoutComponent
  ){

  }

  ngOnInit(): void {
    this.generateForm();
    this.activatedRoute.paramMap.subscribe(params => {
      this.roleId = params.get('role'); 
      if(this.roleId === '1'){
        this.roleName = "Board Member";
      }
      else if(this.roleId === '2'){
        this.roleName = "Executive Member";
      }
      else if(this.roleId === '3'){
        this.roleName = "Member";
      }
      else if(this.roleId === '4'){
        this.roleName = "Fan";
      }
     else{
        this.roleName = this.roleId
      }
    });
    this.getRole(this.roleName);
  }

  ngOnDestroy(): void {
    
  }

  generateForm()
  {
    this.roleForm =this.builder.group({
      canMemberOnboard: [true],
      canMemberEdit: [true],
      canMemberView: [true],
      canMemberDelete: [true],
      canMemberPromoteDemote: [true],
      canGroupCreate: [true],
      canGroupEdit: [true],
      canGroupView: [true],
      canGroupDelete: [true],
      canEventCreate: [true],
      canEventEdit: [true],
      canEventView: [true],
      canEventDelete: [true],
      canEventFrequency: [true],
      canAnnouncementCreate: [true],
      canAnnouncementEdit: [true],
      canAnnouncementView: [true],
      canAnnouncementDelete: [true],
      canBlogCreate: [true],
      canBlogEdit: [true],
      canBlogView: [true],
      canBlogDelete: [true],
      canView: [true],
      canCheck: [true]
    });
  }

  cancel(){
    this.router.navigateByUrl('/role');
  }

  getRole(role:any){
    const params:any = {};
    params['data'] = {
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      role: role
    }
    this.loaderService.show();
    this.apolloClient.setModule('getRolePermissions').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
        return;
      } else {
        this.loaderService.hide();
          this.roleData = response.data;
          // console.log("roleData====", this.roleData);
          
          this.role_id = this.roleData.id;
          this.patchData(this.roleData?.blog, this.roleData?.event, this.roleData?.group, this.roleData?.member, this.roleData?.announcement, this.roleData?.checkin)
          // console.log("roleData====", this.role_id);
          
        }
    });
    
  }

  patchData(blog:any, event:any, group:any, member:any, announcement:any, checkin:any){
    this.roleForm.patchValue({

      canMemberOnboard: member.canOnboard ? member.canOnboard : false,
      canMemberEdit: member.canEdit ? member.canEdit : false,
      canMemberView: member.canView ? member.canView : false,
      canMemberDelete: member.canDelete ? member.canDelete : false,
      canMemberPromoteDemote: member.canPromoteDemote ? member.canPromoteDemote : false,

      canGroupCreate: group.canCreate ? group.canCreate : false,
      canGroupEdit: group.canEdit ? group.canEdit : false,
      canGroupView: group.canView ? group.canView : false,
      canGroupDelete: group.canDelete ? group.canDelete : false,

      canEventCreate: event.canCreate ? event.canCreate : false,
      canEventEdit: event.canEdit ? event.canEdit : false,
      canEventView: event.canView ? event.canView : false,
      canEventDelete: event.canDelete ? event.canDelete : false,
      canEventFrequency: event.canFrequency ? event.canFrequency : false,

      canBlogCreate: blog.canCreate ? blog.canCreate : false,
      canBlogEdit: blog.canEdit ? blog.canEdit : false,
      canBlogView: blog.canView ? blog.canView : false,
      canBlogDelete: blog.canDelete ? blog.canDelete : false,

      canAnnouncementCreate: announcement.canCreate ? announcement.canCreate : false,
      canAnnouncementEdit: announcement.canEdit ? announcement.canEdit : false,
      canAnnouncementView: announcement.canView ? announcement.canView : false,
      canAnnouncementDelete: announcement.canDelete ? announcement.canDelete : false,

      canCheck: checkin.canCheck ? checkin.canCheck : false,
      canView: checkin.canView ? checkin.canView : false
    })
  }

  updateRoleData(){
    if(!this.roleForm.value.canEventView && this.roleForm.value.canCheck){
      this.alertService.error("Please turn on event view button");
      return;
    }
    const params:any={};
    params['data']={
      id: this.role_id,
      member: {
          can_onboard: this.roleForm.value.canMemberOnboard ? this.roleForm.value.canMemberOnboard : false,
          // can_edit: this.roleForm.value.canMemberEdit ? this.roleForm.value.canMemberEdit : false,
          can_edit: false,
          can_view: this.roleForm.value.canMemberView ? this.roleForm.value.canMemberView : false,
          can_delete: this.roleForm.value.canMemberDelete ? this.roleForm.value.canMemberDelete : false,
          can_promote_demote: this.roleForm.value.canMemberPromoteDemote ? this.roleForm.value.canMemberPromoteDemote : false
      },
      event: {
        can_create: this.roleForm.value.canEventCreate ? this.roleForm.value.canEventCreate : false,
        can_edit: this.roleForm.value.canEventEdit ? this.roleForm.value.canEventEdit : false,
        can_view: this.roleForm.value.canEventView ? this.roleForm.value.canEventView : false,
        can_delete: this.roleForm.value.canEventDelete ? this.roleForm.value.canEventDelete : false,
        can_frequency: this.roleForm.value.canEventFrequency ? this.roleForm.value.canEventFrequency : false
      },
      group: {
        can_create: this.roleForm.value.canGroupCreate ? this.roleForm.value.canGroupCreate : false,
        can_edit: this.roleForm.value.canGroupEdit ? this.roleForm.value.canGroupEdit : false,
        can_view: this.roleForm.value.canGroupView ? this.roleForm.value.canGroupView : false,
        can_delete: this.roleForm.value.canGroupDelete ? this.roleForm.value.canGroupDelete : false
      },
      blog: {
        can_create: this.roleForm.value.canBlogCreate ? this.roleForm.value.canBlogCreate : false,
        can_edit: this.roleForm.value.canBlogEdit ? this.roleForm.value.canBlogEdit : false,
        can_view: this.roleForm.value.canBlogView ? this.roleForm.value.canBlogView : false,
        can_delete: this.roleForm.value.canBlogDelete ? this.roleForm.value.canBlogDelete : false
      },
      announcement: {
        can_create: this.roleForm.value.canAnnouncementCreate ? this.roleForm.value.canAnnouncementCreate : false,
        can_edit: this.roleForm.value.canAnnouncementEdit ? this.roleForm.value.canAnnouncementEdit : false,
        can_view: this.roleForm.value.canAnnouncementView ? this.roleForm.value.canAnnouncementView : false,
        can_delete: this.roleForm.value.canAnnouncementDelete ? this.roleForm.value.canAnnouncementDelete : false
      },
      checkin:{
        can_view: this.roleForm.value.canView ? this.roleForm.value.canView : false,
        can_check: this.roleForm.value.canCheck ? this.roleForm.value.canCheck : false,
      }
    }

    this.loaderService.show();
    this.apolloClient.setModule("updateRolePermissions").mutateData(params).subscribe((response:any) => {
    this.loaderService.hide();
      if(response.error){
        this.alertService.error(response.message)
      }
      else{
        this.alertService.error(response.message);
        if(this.roleData?.role === this.storageService.getLocalStorageItem('role')){
          this.storageService.setLocalStorageItem("setRole",{
            member:{
              canOnboard: this.roleForm.value.canMemberOnboard ? this.roleForm.value.canMemberOnboard : false,
              // canEdit: this.roleForm.value.canMemberEdit ? this.roleForm.value.canMemberEdit : false,
              can_edit: false,
              canView: this.roleForm.value.canMemberView ? this.roleForm.value.canMemberView : false,
              canDelete: this.roleForm.value.canMemberDelete ? this.roleForm.value.canMemberDelete : false,
              canPromoteDemote: this.roleForm.value.canMemberPromoteDemote ? this.roleForm.value.canMemberPromoteDemote : false
            },
            event: {
              canCreate: this.roleForm.value.canEventCreate ? this.roleForm.value.canEventCreate : false,
              canEdit: this.roleForm.value.canEventEdit ? this.roleForm.value.canEventEdit : false,
              canView: this.roleForm.value.canEventView ? this.roleForm.value.canEventView : false,
              canDelete: this.roleForm.value.canEventDelete ? this.roleForm.value.canEventDelete : false,
              canFrequency: this.roleForm.value.canEventFrequency ? this.roleForm.value.canEventFrequency : false
            },
            group: {
              canCreate: this.roleForm.value.canGroupCreate ? this.roleForm.value.canGroupCreate : false,
              canEdit: this.roleForm.value.canGroupEdit ? this.roleForm.value.canGroupEdit : false,
              canView: this.roleForm.value.canGroupView ? this.roleForm.value.canGroupView : false,
              canDelete: this.roleForm.value.canGroupDelete ? this.roleForm.value.canGroupDelete : false
            },
            blog: {
              canCreate: this.roleForm.value.canBlogCreate ? this.roleForm.value.canBlogCreate : false,
              canEdit: this.roleForm.value.canBlogEdit ? this.roleForm.value.canBlogEdit : false,
              canView: this.roleForm.value.canBlogView ? this.roleForm.value.canBlogView : false,
              canDelete: this.roleForm.value.canBlogDelete ? this.roleForm.value.canBlogDelete : false
            },
            announcement: {
              canCreate: this.roleForm.value.canAnnouncementCreate ? this.roleForm.value.canAnnouncementCreate : false,
              canEdit: this.roleForm.value.canAnnouncementEdit ? this.roleForm.value.canAnnouncementEdit : false,
              canView: this.roleForm.value.canAnnouncementView ? this.roleForm.value.canAnnouncementView : false,
              canDelete: this.roleForm.value.canAnnouncementDelete ? this.roleForm.value.canAnnouncementDelete : false
            },
            checkin:{
              canView: this.roleForm.value.canView ? this.roleForm.value.canView : false,
              canCheck: this.roleForm.value.canCheck ? this.roleForm.value.canCheck : false,
            }            
          });
        }
      }
      this.layoutComponent.updateMenuList();
      this.router.navigateByUrl('/role');
    });
  }
}



import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveMemberDetails } from 'src/app/shared/typedefs/custom.types';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Subscription } from 'rxjs';
declare var window:any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {
  stateSubscriber!: Subscription;
  activeMemberDetails!: any;
  addActiveMemberDetails!:any
  current: number = 1;
  total!: number;
  totalData!:number;
  comName!: string;
  userId: any;
  sameUser: boolean = false;
  getState: any;
  stateName!: string;
  countryName!:string;
  userRole!:string;
  $readModal: any;
  aboutDetails!: string;


  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ){
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.userId = params.get('id');
      },
      error: err => {}
    });
    if(this.userId === this.storageService.getLocalStorageItem('userId')){
      this.sameUser = true;
    }
    else{
      this.sameUser = false;
    }
  }
  ngOnInit(): void {
    this.comName = this.storageService.getLocalStorageItem('communityName');
    this.getActiveMemberDetails(this.current);
  }
  ngOnDestroy(): void {
    if(this.stateSubscriber){
      this.stateSubscriber.unsubscribe();
    }
  }

  getActiveMemberDetails(page:number){
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const params = {
      data:{
        id: id,
        page: page,
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberDetails').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.activeMemberDetails = response.data.user;
        // this.addActiveMemberDetails = response.data.user.familyMembers;
        this.addActiveMemberDetails = response?.data?.filterFamilymembers;
        this.totalData = response.data.totalFamilyMembers;
        this.userRole = response.data?.role;

        if(response.data.totalFamilyMembers !== 0) {
          this.total = Math.ceil(response.data.totalFamilyMembers / 10);
        }else {
          this.total = 0;
        }
        if(this.activeMemberDetails?.countryCode === "IN"){
          this.countryName = "India";
        }
        else if(this.activeMemberDetails?.countryCode === "US"){
          this.countryName = "United States";
        }
        else if(this.activeMemberDetails?.countryCode === "GB"){
          this.countryName = "United Kingdom";
        }
        else if(this.activeMemberDetails?.countryCode === "CA"){
          this.countryName = "Canada";
        }
        else{
          this.countryName = "N/A";
        }
        this.changeState();
      }
    });
  }

  back(){
    this.router.navigateByUrl('active-members');
  }

  track(){
    this.router.navigateByUrl('active-members/track');
  }

  onboardUser(){
    this.router.navigateByUrl('/active-members/passive-users');
  }

  onGoTo(page: number): void {
    this.current = page
    this.getActiveMemberDetails(this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getActiveMemberDetails(this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getActiveMemberDetails(this.current);
  }

  /**Using for state change in depends on country */
  changeState(){
    const params= {
      data:{
        countryCode: this.activeMemberDetails?.countryCode
      }
    }
    this.loaderService.show();
    this.stateSubscriber = this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getState = response.data;
        this.getState.filter((val:any)=>{
          if(val.stateCode === this.activeMemberDetails?.state){
            this.stateName = val.name;
          }
        })
        
        
      }
    });
    this.loaderService.hide();
  }

  moreDetails(title:any){
    this.$readModal = new window.bootstrap.Modal(
      document.getElementById("aboutModal")
    );
    this.aboutDetails = title;
    this.$readModal.show();
  }

  deleteFamilyMember(memberId:any,index:any){
    Swal.fire({
      title: 'Are you sure you want to delete this family member?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        this.removeRow(memberId,index);
      }
    })
  }


   /**Using for remove row after delete */
   removeRow(memberId:any,index:any){
    const params:any= {};
    params['data'] = {
      familyMemberId : memberId,
      userId: this.userId
    }
    this.loaderService.show();
    this.apolloClient.setModule('adminRemoveFamilyMember').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } 
      else {
        this.alertService.success(response.message);
        this.addActiveMemberDetails.splice(index,1);
      }
    });
  }

  /**Using for redirect to view members page */
  viewFamilyMemberDetails(memberId:any){
    this.router.navigateByUrl('/active-members/view-members/'+this.userId+'/'+memberId);
  }

  /**Using for redirect to edit member page */
  editFamilyMemberDetails(memberId:any){
    this.router.navigateByUrl('/active-members/edit-members/'+this.userId+'/'+memberId);
  }

}

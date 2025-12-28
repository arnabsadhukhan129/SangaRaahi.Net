import { Component, OnInit } from '@angular/core';
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
@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent {
  memberList: any
  communityId!: string;
  searchForm!: FormGroup;
  isSelected:boolean= true;
  current: number = 1;
  total!: number;
  date:any;
  toggleFilter:boolean = false;
  totalData!:number;
  seachFilter:boolean = false;
  from!: number;
  to!: number;
  comName!: string;
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private datePipe: DatePipe
  ){}

  ngOnInit(): void {
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
    this.comName = this.storageService.getLocalStorageItem('communityName');
    this.generateSearchForm();
    this.getInvitationPendingList(this.communityId, this.current);
  }

  generateSearchForm() {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
      acknowladgementStatus: new FormControl(''),
      AcknowladgementDateStart: new FormControl(''),
      AcknowladgementDateEnd: new FormControl('')
    });
  }

  getInvitationPendingList(id:any, page : Number){
    const params:any = {};
    params['data'] = {
      communityId: id,
      page: page,
      isTrack: true
    }
    if(this.searchForm.value.search && this.searchForm.value.search!=''){
     params['data'].search = this.searchForm.value.search.trim();
    }


    if(this.searchForm.value.AcknowladgementDateStart!='' && this.searchForm.value.AcknowladgementDateEnd!=''){
    if(this.datePipe.transform(this.searchForm.value.AcknowladgementDateStart,'yyyy-MM-dd') === this.datePipe.transform(this.searchForm.value.AcknowladgementDateEnd,'yyyy-MM-dd')){
      this.alertService.error("Acknowladgement start date and acknowladgement end date are not same");
      return;
    }
    params['data'].AcknowladgementDateStart = this.searchForm.value.AcknowladgementDateStart;
    params['data'].AcknowladgementDateEnd = this.searchForm.value.AcknowladgementDateEnd;
    }

    if(this.searchForm.value.acknowladgementStatus && this.searchForm.value.acknowladgementStatus!=''){
      params['data'].acknowladgementStatus = this.searchForm.value.acknowladgementStatus;
    }

    //console.log("params..........",params);


    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      //console.log("response........",response);

      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
          this.memberList = response.data.members;
          this.totalData = response.data.total;
          this.from = response.data?.from;
          this.to = response.data?.to;

          //this.total = 0;
          if(response.data.total !== 0) {
            this.total = Math.ceil(response.data.total / 10);
          }else {
            this.total = 0;
          }
        }
    });
  }

  onGoTo(page: number): void {
    this.current = page
    this.getInvitationPendingList(this.communityId, this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getInvitationPendingList(this.communityId, this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getInvitationPendingList(this.communityId, this.current);
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

  clearDateFilter() {
    this.searchForm.controls['search'].setValue('');
    this.searchForm.controls['acknowladgementStatus'].setValue('');
    this.searchForm.controls['AcknowladgementDateStart'].setValue('');
    this.searchForm.controls['AcknowladgementDateEnd'].setValue('');
    this.getInvitationPendingList(this.communityId,1);
  }

  onboardUser(){
    this.router.navigateByUrl('/active-members/passive-users');
  }

  resendInvitation(memberId:any){
    const params:any = {};
    params['data'] = {
      id: memberId
    }
    this.loaderService.show();
    this.apolloClient.setModule("resendOnboardingInvitation").mutateData(params).subscribe((response:any) => {
    this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.alertService.success(response.message);
      }
    });
  }

  back(){
    this.router.navigateByUrl('active-members');
  }

  /**Using for edit page redirection */
  editDetails(userId: any){
    this.router.navigateByUrl('/active-members/edit-passive-members/'+userId);
  }

  /**Redirect to passive member view page */
  viewPassiveMember(id: any){
    this.router.navigateByUrl('active-members/passive-member-view/'+id);
  }
}

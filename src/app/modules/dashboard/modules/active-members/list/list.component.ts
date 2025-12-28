import { Component, DoCheck, OnInit } from '@angular/core';
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
import {CsvService} from 'src/app/shared/services/csv.service';
import { HttpResponse } from '@angular/common/http';
import { CommonService } from '../../../services/common.service';
declare var window:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, DoCheck {
  // activeMemberList!: Array<ActiveMemberList>;
  activeMemberList: any
  communityId!: string;
  searchForm!: FormGroup;
  isSelected:boolean= true;
  current: number = 1;
  total!: number;
  date:any;
  toggleFilter:boolean = false;
  seachFilter:boolean = false;
  totalData!:number;
  from!: number;
  to!: number;
  comName!: string;
  type!: any;
  userId!: string;
  $modal: any;
  $groupModal: any;
  userEmail!: string;
  userPhone!: string;
  userType!: string
  uid!:string;
  role1!: string;
  role2!: string;
  getGroupDetails:any = [];
  userName!: string;
  profileImage!:string;
  name!: string;
  itemsPerPage: number = 10;
  getmemberListLength: any
  getMemberDetails: any;

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
    public csvService: CsvService,
    private commonService: CommonService
  ){
    this.commonService.sendSearch("no search");
  }
  ngOnInit(): void {
    this.commonService.getUrl().subscribe((page:any)=>{
      if(page){
        this.current = page
      }
      else{
        this.current = 1;
      }
    });
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
    this.comName = this.storageService.getLocalStorageItem('communityName');
    this.generateSearchForm();
    this.getTotalData();
    this.userId =  this.storageService.getLocalStorageItem('userId');
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getMemberDetails = saveRole?.member;
  }

  ngDoCheck(): void {
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getMemberDetails = saveRole?.member;
  }

  generateSearchForm() {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
      status: new FormControl(''),
      roles: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      filter: new FormControl(''),
      sortByName: new FormControl('')
    });
  }

  getTotalData(){
    const params:any = {};
    params['data'] = {
      communityId: this.communityId,
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
        this.getmemberListLength = response.data.members?.length;
        this.getActiveMembersList(this.communityId, this.current);
      }
    })
  }
  
  getActiveMembersList(id:any, page : number){
   this.type = this.activatedRoute.snapshot.paramMap.get("type") ? this.activatedRoute.snapshot.paramMap.get("type") : '';
    const params:any = {};
    params['data'] = {
      communityId: id,
      page: page,
      isTrack: false,
      limit: 10
      // limit: this.row_limit
    }
    if(this.searchForm.value.search && this.searchForm.value.search!=''){
     params['data'].search = this.searchForm.value.search.trim();
     params['data'].page = 1;
    }
    if(this.searchForm.value.status && this.searchForm.value.status!=''){
      if(this.searchForm.value.status === "1"){
        params['data'].isActiveMember = true;
      }
      else{
        params['data'].isActiveMember = false;
      }
     }
     if(this.searchForm.value.roles && this.searchForm.value.roles!=''){
      params['data'].roles = this.searchForm.value.roles;
      params['data'].page = 1;
     }
     if(this.searchForm.value.startDate!=''){
      if(this.searchForm.value.endDate === '' || null){
        this.alertService.error("End date is missing");
        return;
      }
      // console.log(this.datePipe.transform(this.searchForm.value.startDate,'yyyy-MM-dd'));
      // console.log(this.datePipe.transform(this.searchForm.value.endDate,'yyyy-MM-dd'));
      if(this.datePipe.transform(this.searchForm.value.startDate,'yyyy-MM-dd') === this.datePipe.transform(this.searchForm.value.endDate,'yyyy-MM-dd')){
        this.alertService.error("Start date and end date are not same");
        return;
      }
      params['data'].startDate = this.searchForm.value.startDate;
      params['data'].endDate = this.searchForm.value.endDate;
     }
     if(this.type){
      //console.log("this.type......",this.type);
      params['data'].roles = this.type;
    }
    if(this.searchForm.value.filter && this.searchForm.value.filter!=''){
      params['data'].filter = this.searchForm.value.filter;
    }

    if(this.searchForm.value.sortByName && this.searchForm.value.sortByName!=''){
      if(this.searchForm.value.sortByName === 'descName'){
        params['data'].columnName = "name";
        params['data'].sort = "desc";
      }
      else if(this.searchForm?.value?.sortByName === 'ascName'){
        params['data'].columnName = "name";
        params['data'].sort = "asc";
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
          this.activeMemberList = response.data.members;
          // this.totalData = this.activeMemberList?.length;
          // this.totalData = this.getmemberListLength
          this.totalData = response.data.total;
          this.from = (page - 1) * 10 + 1; 
          this.to = Math.min(page * 10, this.totalData);
          // this.total = Math.ceil(this.totalData / 10);
          // this.totalData = response.data.total;
          // this.from = response.data?.from;
          // this.to = response.data?.to;
          //this.total = 0;
          if(this.totalData !== 0) {
            // this.total = Math.ceil(response.data.total / 10);
            this.total = Math.ceil(this.totalData / 10);
          }else {
            this.total = 0;
          }
        }
    });
    this.loaderService.hide();
  }

  onGoTo(page: number): void {
    this.current = page
    this.getActiveMembersList(this.communityId, this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getActiveMembersList(this.communityId, this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getActiveMembersList(this.communityId, this.current);
  }

  viewDetails(id:any){
    this.commonService.sendUrl(this.current);
    this.router.navigateByUrl('active-members/view/'+id);
  }

  changeStatus(memberId:any,index:any){
    const params:any= {};
    params['data'] = {
      communityId : this.communityId,
      memberId : memberId
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityMemberStatusChange').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      // console.log("response......",response);
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.alertService.success(response.message);
        //console.log("isActive.....",this.activeMemberList[index].members.isActive);
        this.activeMemberList[index].members.isActive = this.activeMemberList[index].members.isActive === false ?  true : false
        //this.activeMemberList.splice(index,1);
      }
    });
  }

  deleteMember(memberId:any,index:any){
    Swal.fire({
      title: 'Are you sure you want to delete this member?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        this.removeRow(memberId, index);
      }
    })
  }

  removeRow(memberId:any,index:any){
    const params:any= {};
    params['data'] = {
      communityId : this.communityId,
      memberId : memberId
    }
    this.loaderService.show();
    this.apolloClient.setModule('deleteCommunityMember').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.alertService.success(response.message);
        this.activeMemberList.splice(index,1);
        if(this.activeMemberList.length === 0){
          this.onPrevious(this.current);
        }
        else{
          this.getActiveMembersList(this.communityId,this.current);
        }
        
      }
    });
  }

  /**For Promote */
  promote(memberId:any){
    const params:any= {};
    params['data'] = {
      communityId : this.communityId,
      memberId : memberId,
      promote: true
    }
    this.loaderService.show();
    this.apolloClient.setModule('promoteOrDemoteCommunityMember').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.alertService.success(response.message);
        this.getActiveMembersList(this.communityId,this.current);
        this.$modal.hide();
      }
    });
  }

  demoteUser(memberId:any){
    if(this.userId === memberId){
      Swal.fire({
        title: 'Are you sure you want to be demoted from the current role? Note your current session will be logged out. Please log in again for the changes to reflect. ',
        text: '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if(result.value){
          this.demote(memberId);
        }
      })
    }
    else{
      this.demote(memberId);
    }
  }

  /**For Demote */
  demote(memberId:any){
    const params:any= {};
    params['data'] = {
      communityId : this.communityId,
      memberId : memberId,
      promote: false
    }
    this.loaderService.show();
    this.apolloClient.setModule('promoteOrDemoteCommunityMember').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
        this.$modal.hide();
      } else {
        this.alertService.success(response.message);
        this.getActiveMembersList(this.communityId,this.current);
        this.$modal.hide();
        if(this.userId === memberId){
          this.authService.logout();
        }
      }
    });
  }

  // clear(): void {
  //   this.searchForm.controls['search'].setValue('');
  //   this.getActiveMembersList(this.communityId,1);
  // }

  clearDateFilter() {
    this.searchForm.controls['status'].setValue('');
    this.searchForm.controls['roles'].setValue('');
    this.searchForm.controls['search'].setValue('');
    this.searchForm.controls['startDate'].setValue('');
    this.searchForm.controls['endDate'].setValue('');
    this.searchForm.controls['filter'].setValue('');
    this.searchForm.controls['sortByName'].setValue('');
    // this.toggleFilter = false;
    // this.seachFilter = false;
    this.getActiveMembersList(this.communityId,1);
  }

  toggle(){
    if( this.toggleFilter === false){
      // this.clearDateFilter();
      this.seachFilter = false;
      this.toggleFilter = true;
    }
    else{
      this.toggleFilter = false;
    }
  }

  toggleSearch(){
    if( this.seachFilter === false){
      // this.clearDateFilter()
      this.toggleFilter = false;
      this.seachFilter = true;
    }
    else{
      this.seachFilter = false;
    }
  }

  track(){
    this.router.navigateByUrl('/active-members/track');
  }

  onboardUser(){
    this.paramService.updatecurrentRoute('/active-members/passive-users');
    this.router.navigateByUrl('/active-members/passive-users');
  }

  back(){
    this.paramService.updatecurrentRoute('/dashboard');
    this.router.navigateByUrl('/dashboard');
  }

  /** Using for promote or demote modal open*/
  promoteModal(userData:any){
    //console.log("userData.....",userData);
    
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("promoteModal")
    );
    this.uid = userData?.user?.id
    this.userEmail = userData?.user?.email;
    this.userPhone = userData?.user?.phone;
    this.userType = userData?.roles;
    this.profileImage = userData?.user?.profileImage;
    this.name = userData?.user?.name;
    if(this.userType === 'Board Member'){
      this.role2 = 'Executive Member'
    }
    else if(this.userType === 'Executive Member'){
      this.role1 = 'Board Member';
      this.role2 = 'Member';
    }
    else if(this.userType === 'Member'){
      this.role1 = 'Executive Member'
      this.role2 = 'Fan'
    }
    else if(this.userType === 'Fan'){
      this.role1 = 'Member'
    }
    this.$modal.show();
  }

 /** Using for promote or demote modal close*/
  closeModal(){
    this.$modal.hide();
  }

  /**get all member data for export to csv */
  exportMember(type:string) {
    this.loaderService.show();
    if(type === 'all'){
      this.csvService.getMemberReq(this.communityId).subscribe(
        (response: HttpResponse<Blob>) => {
          this.loaderService.hide();
          const contentDispositionHeader = response.headers.get('Content-Disposition');
          if (contentDispositionHeader) {
            const filename = contentDispositionHeader.split(';')[1].trim().split('=')[1];
            const blobParts: BlobPart[] = [response.body!];
            const options: BlobPropertyBag = { type: response.body?.type };
            const blob = new Blob(blobParts, options);
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            // Handle the case where Content-Disposition header is missing
            // For example, you can generate a default filename or provide an error message
            const defaultFilename = 'member-list';
            const blob = new Blob([response.body!], { type: response.body?.type });
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = defaultFilename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            console.warn('Content-Disposition header is missing in the response. Using default filename.');
          }
        },
        (error) => {
          // Handle error if needed
          console.error('Error:', error);
          this.loaderService.hide();
        }
      );
    }

    else if(type === 'family'){
      this.csvService.getMemberFamilyWiseReq(this.communityId).subscribe(
        (response: HttpResponse<Blob>) => {
          this.loaderService.hide();
          const contentDispositionHeader = response.headers.get('Content-Disposition');
          if (contentDispositionHeader) {
            const filename = contentDispositionHeader.split(';')[1].trim().split('=')[1];
            const blobParts: BlobPart[] = [response.body!];
            const options: BlobPropertyBag = { type: response.body?.type };
            const blob = new Blob(blobParts, options);
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            // Handle the case where Content-Disposition header is missing
            // For example, you can generate a default filename or provide an error message
            const defaultFilename = 'member-list-family';
            const blob = new Blob([response.body!], { type: response.body?.type });
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = defaultFilename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            console.warn('Content-Disposition header is missing in the response. Using default filename.');
          }
        },
        (error) => {
          // Handle error if needed
          console.error('Error:', error);
          this.loaderService.hide();
        }
      );
    }
    else if(type === 'group'){
      this.csvService.getMemberGroupWiseReq(this.communityId).subscribe(
        (response: HttpResponse<Blob>) => {
          this.loaderService.hide();
          const contentDispositionHeader = response.headers.get('Content-Disposition');
          if (contentDispositionHeader) {
            const filename = contentDispositionHeader.split(';')[1].trim().split('=')[1];
            const blobParts: BlobPart[] = [response.body!];
            const options: BlobPropertyBag = { type: response.body?.type };
            const blob = new Blob(blobParts, options);
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } else {
            // Handle the case where Content-Disposition header is missing
            // For example, you can generate a default filename or provide an error message
            const defaultFilename = 'member-list-group';
            const blob = new Blob([response.body!], { type: response.body?.type });
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = defaultFilename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            console.warn('Content-Disposition header is missing in the response. Using default filename.');
          }
        },
        (error) => {
          // Handle error if needed
          console.error('Error:', error);
          this.loaderService.hide();
        }
      );
    }
  }

  /**Using for modal open group list*/
  groupModal(groups:[], name: string){
    this.getGroupDetails = groups;
    this.userName = name;
    this.$groupModal = new window.bootstrap.Modal(
      document.getElementById("groupModal")
    );
    this.$groupModal.show();
  }

  editDetails(userId: any){
    this.router.navigateByUrl('/active-members/edit-user/'+userId);
  }
}

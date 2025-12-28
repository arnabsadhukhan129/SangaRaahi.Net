import {  Component, OnInit, Output, EventEmitter, DoCheck} from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Announcement } from 'src/app/shared/models/announcements.model';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { paramService } from 'src/app/shared/params/params';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';

declare var window:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListAnnouncementComponent implements OnInit, DoCheck  {


  announcementList: Announcement[] = [];
  communityId: string = this.storageService.getLocalStorageItem('communtityId');
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  seachFilter:boolean = false;
  toggleFilter:boolean = false;
  $modal: any;
  announcementId!: string;
  $readModal: any;
  getannouncementName!: string;
  sortName: boolean = false;
  sortDate: boolean = false;
  getAnnouncementDetails: any;
  /**
     * Constructor
     */
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private paramService:paramService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService
  )
  {
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
    })
    this.generateSearchForm();
    this.getAnnouncementList(this.communityId, this.current);
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getAnnouncementDetails = saveRole?.announcement;
  }

  ngDoCheck(): void {
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getAnnouncementDetails = saveRole?.announcement;
  }

  generateSearchForm() {
    this.filterForm = new FormGroup({
      status: new FormControl(''),
      sortByName: new FormControl(''),
      sortByDate: new FormControl(''),
    });

    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  //Using for choose sort option
  sortData(event:any){
    if(event.target.value === 'name'){
      this.sortName = true;
      this.sortDate = false;
      this.filterForm.controls['sortByDate'].setValue('');
    }
    else if(event.target.value === 'date'){
      this.sortDate = true;
      this.sortName = false;
      this.filterForm.controls['sortByName'].setValue('');
    }
  }

  getAnnouncementList(id:any, page : Number){
    const searchData = this.activatedRoute.snapshot.paramMap.get("value") ? this.activatedRoute.snapshot.paramMap.get("value") : '';
    const params:any = {};
    params['data'] = {
      communityId: id,
      announcementType: null,
      page: page,
      isActive: null
    }

    if(searchData){
      params['data'].search = searchData.trim();
      params['data'].page = 1;
    }

    if(this.searchForm.value.search && this.searchForm.value.search!=''){
      params['data'].search = this.searchForm.value.search.trim();
      params['data'].page = 1;
     }
     
    if(this.filterForm.value.status && this.filterForm.value.status!=''){
      // if(this.filterForm.value.status === "1"){
      //   params['data'].isActive = true;
      // }
      // else{
      //   params['data'].isActive = false;
      // }

      params['data'].isActive = this.filterForm.value.status;
     }   

     if(this.filterForm.value.sortByDate && this.filterForm.value.sortByDate!=''){
      if(this.filterForm.value.sortByDate === 'descDate'){
        params['data'].columnName = "DateSort";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByDate === 'ascDate'){
        params['data'].columnName = "DateSort";
        params['data'].sort = "asc";
      }
     }

     if(this.filterForm.value.sortByName && this.filterForm.value.sortByName!=''){
      if(this.filterForm.value.sortByName === 'descName'){
        params['data'].columnName = "AnnouncementName";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByName === 'ascName'){
        params['data'].columnName = "AnnouncementName";
        params['data'].sort = "asc";
      }
    }

    this.loaderService.show();


    this.apolloClient.setModule('getAllAnnouncementOrganization').queryData(params).subscribe((response: GeneralResponse) => {
      
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
        return;
      } else {
        this.loaderService.hide();
        //console.log('-------------', response);
          this.announcementList = response.data.announcements;
          this.totalData = response.data.total;
          this.from = response.data?.from;
          this.to = response.data?.to;
          
          if(response.data.total !== 0) {
            this.totalPageNo = Math.ceil(response.data.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }     
        }
    });
  }

  public onGoTo(page: number): void {
    this.current = page
    this.getAnnouncementList(this.communityId, this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getAnnouncementList(this.communityId, this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getAnnouncementList(this.communityId, this.current);
  }

  public back()
  {
    this.paramService.updatecurrentRoute('/dashboard');
    this.router.navigateByUrl('/dashboard');
  }

  changeStatus(announcementId:any,index:any){
    const params:any= {};
    params['myCommunityAnnouncementStatusChangeId'] = announcementId;

    this.loaderService.show();

    this.apolloClient.setModule('myCommunityAnnouncementStatusChange').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        //this.announcementList[index].isActive = !this.announcementList[index].isActive;
        if(this.announcementList[index].isActive === 'active')
        {
           this.announcementList[index].isActive = 'inactive';
        }
        else if(this.announcementList[index].isActive === 'inactive')
        {
           this.announcementList[index].isActive = 'active';
        }
        this.alertService.success(response.message);
      }
    });
  }

  editAnnouncement(announcementId:any,status:any)
  {
      if(status === 'past')
      {
            Swal.fire({
              title: 'You cant edit past announcement',
              text: '',
              icon: 'warning',
              showCancelButton: false,
              // confirmButtonText: 'Ok'
            }).then((result)=>{

              //console.log('================>',result.value);

            })
      }
      else
      {
        this.commonService.sendUrl(this.current);
        this.router.navigateByUrl(`announcements/edit/${announcementId}`);
      }
  }

  deleteAnnouncement(announcementId:any,index:any){
    Swal.fire({
      title: 'Are you sure you want to delete this announcement?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        this.removeRow(announcementId, index);
      }
    })
  }

  removeRow(announcementId:any,index:any){
    const params:any= {};
    params['deleteAnnouncementOrganizaztionId'] = announcementId;

    this.loaderService.show();
    this.apolloClient.setModule('deleteAnnouncementOrganizaztion').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.announcementList.splice(index,1);
        this.alertService.success(response.message);
        if(this.announcementList.length === 0){
          this.onPrevious(this.current);
        }
      }
    });
  }

  toggle(){
    if( this.toggleFilter === false){
      //this.clearDateFilter();
      this.seachFilter = false;
      this.toggleFilter = true;
    }
    else{
      this.toggleFilter = false;
    }
  }

  toggleSearch(){
    if( this.seachFilter === false){
      //this.clearDateFilter()
      this.toggleFilter = false;
      this.seachFilter = true;
    }
    else{
      this.seachFilter = false;
    }
  }

  clearDateFilter() {
    this.filterForm.controls['status'].setValue('');
    this.searchForm.controls['search'].setValue('');
    this.current = 1;
    this.getAnnouncementList(this.communityId,this.current);
  }

  displayAnnouncementDetail(announcementId : string){

    this.announcementId = announcementId;   

      this.$modal = new window.bootstrap.Modal(
        document.getElementById("displayEvent")
      );
      this.$modal.show();
    
  }

  restrictSpecialCharacter(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode == 8 || charCode == 32 || (charCode >= 48 && charCode <= 57))
    {
        return true;
    }
    else 
    {
        return false;
    }
  }

  /**Using for read more details */
  moreDetails(datails:any){
    this.$readModal = new window.bootstrap.Modal(
      document.getElementById("announceNameModal")
    );
    this.getannouncementName = datails.title;
    this.$readModal.show();
  }

}

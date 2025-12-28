import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { paramService } from 'src/app/shared/params/params';
import {  Router } from '@angular/router';
declare var window:any;
@Component({
  selector: 'app-app-log',
  templateUrl: './app-log.component.html',
  styleUrls: ['./app-log.component.css']
})
export class AppLogComponent implements OnInit {
  $modal: any;
  activityLogs: any[] = [];
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!: number;
  from!: number;
  to!: number;
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  logSubscriber!: Subscription;
  communityId: string | null = null;
  seachFilter: boolean = false;
  $logModal: any;
  modalTitle: string = '';
  modalOldData: any = null;
  modalNewData: any = null;
  modalData: any;
  toggleFilter: boolean = false;

  actionOptions = [
    { label: 'All', value: '' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Profile Update', value: 'PROFILE_UPDATE' },
    { label: 'Remove Family Member', value: 'REMOVE_FAMILYMEMBER' },
    { label: 'Add', value: 'ADD' },
    { label: 'Delete', value: 'DELETE' },
    { label: 'Delete Own Account', value: 'DELETE_OWN_ACCOUNT' },
    { label: 'Login', value:'LOG_IN'},
    { label: 'Leave', value:'LEAVE'},
    { label: 'Create', value:'CREATE'},
    { label: 'Self Volunteer', value:'SELF_VOLUNTEER'},
    { label: 'Update', value:'UPDATE'},
    { label: 'Cancel', value:'CANCEL'},
    { label: 'Add Family Member', value:'ADD_FAMILYMEMBER'},
    { label: 'Add To Favourite', value:'ADDTOFAVOURITE'},
    { label: 'Remove To Favourite', value:'REMOVETOFAVOURITE'},
    { label: 'Attending', value:'ATTENDING'},
    { label: 'Not Attending', value:'NOT_ATTENDING'}
  ];
  
  roleOptions = [
    {label: 'All', value: ''},
    {label: 'Board Member	', value: 'board_member'},
    {label: 'Executive Member', value: 'executive_member'},
    {label: 'Member', value: 'member'},
    {label: 'Fan', value: 'fan'},
  ];

  moduleOptions = [
    { label: 'All', value: '' },
    { label: 'Authentication', value: 'AUTHENTICATION'},
    { label: 'Community', value: 'COMMUNITY'},
    { label: 'Event Memory', value: 'EVENT_MEMORY'},
    { label: 'Event Supplier', value: 'EVENT_SUPPLIER'},
    { label: 'Event Task', value: 'EVENT_TASK' },
    { label: 'Event RSVP', value: 'EVENT_RSVP' },
    { label: 'Event', value: 'EVENT' },
    { label: 'User', value: 'USER' },
    { label: 'Contact', value: 'CONTACT' },
    { label: 'Profile', value: 'PROFILE' },
  ];

  constructor(
    private paramService: paramService,
    private router: Router,
    private storageService: StorageService,
    private apolloClient: ApolloClientService,
    private loaderService: LoaderService,
    private alertService: AlertService
  ) {
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
  }

   ngOnInit(): void {
    this.generateSearchForm();
    this.generateFilterForm();
    this.getActivityLogs(this.current);
  }

 generateSearchForm() {
    this.searchForm = new FormGroup({
      search: new FormControl('')
    });
  }



  generateFilterForm() {
    this.filterForm = new FormGroup({
      action: new FormControl(''),
      sort: new FormControl(''),
      memberRole: new FormControl(''),
      module: new FormControl('')
    });
  }



   getActivityLogs(page: number) {
    if (!this.communityId) {
      this.alertService.error('Community ID not found.');
      return;
    }

    const params: any = {};
    params['data'] = {
      communityId: this.communityId,
      platForm: "app",
      page: page
    };

    if (this.searchForm?.value.search && this.searchForm?.value.search.trim() !== '') {
      params['data'].search = this.searchForm.value.search.trim();
      params['data'].page = 1;
    }

    if(this.filterForm?.value.action && this.filterForm?.value.action!=''){
       params['data'].action = this.filterForm?.value.action;
    }
    if(this.filterForm?.value.module && this.filterForm?.value.module!=''){
      params['data'].module = this.filterForm?.value.module;
    }
    if(this.filterForm?.value.memberRole && this.filterForm?.value.memberRole!=''){
      params['data'].memberRole = this.filterForm?.value.memberRole;
    }

    if(this.filterForm?.value?.sort && this.filterForm?.value?.sort!=''){
      if(this.filterForm?.value?.sort === 'desc'){
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sort === 'asc'){
        params['data'].sort = "asc";
      }
    }

    this.loaderService.show();
    this.logSubscriber = this.apolloClient.setModule('getAllActivityLogs').queryData(params).subscribe({
      next: (response: GeneralResponse) => {
        this.loaderService.hide();
        if (!response || response.error) {
          this.alertService.error(response?.message || 'Unknown error occurred.');
          return;
        }
        this.activityLogs = response.data?.alllogs || [];
        this.totalData = response.data?.total || 0;
        this.from = response.data?.from || 0;
        this.to = response.data?.to || 0;
        if (this.totalData !== 0) {
          this.totalPageNo = Math.ceil(this.totalData / this.limit);
        } else {
          this.totalPageNo = 0;
        }
      },
      error: (err) => {
        this.loaderService.hide();
        this.alertService.error('Failed to fetch activity logs.');
        console.error('Subscription Error:', err);
      }
    });
  }


   onGoTo(page: number): void {
    this.current = page;
    this.getActivityLogs(this.current);
  }



   onNext(page: number): void {
    this.current = page + 1;
    this.getActivityLogs(this.current);
  }



   onPrevious(page: number): void {
    this.current = page - 1;
    this.getActivityLogs(this.current);
  }


  clearSearch() {
    this.searchForm.controls['search'].setValue('');
    this.getActivityLogs(this.current);
  }


  searchToggle() {
    this.seachFilter = !this.seachFilter;
  }

   openModal(title: string = 'Log details', oldData: any = null, newData: any = null) {
  this.modalTitle = title;
  this.modalOldData = oldData;
  this.modalNewData = newData;

  const el = document.getElementById("logModal");
  if (!el) return;

  // create/show modal instance
  // @ts-ignore
  this.$logModal = new (window as any).bootstrap.Modal(el);
  this.$logModal.show();
}

closeModal() {
  if (this.$logModal) {
    this.$logModal.hide();
    return;
  }
  // fallback (if you didn't save instance)
  const el = document.getElementById("logModal");
  if (!el) return;
  // @ts-ignore
  const inst = (window as any).bootstrap.Modal.getInstance(el);
  if (inst) inst.hide();
}

   back(){
    this.paramService.updatecurrentRoute('/dashboard');
    this.router.navigateByUrl('/dashboard');
  }


   /**Using toggle for filter */
    filterToggle(){
      if(!this.toggleFilter){
        this.toggleFilter = true;
        // this.seachFilter = false;
        this.clear();
      }
      else{
        this.toggleFilter = false;
        this.clear();
      }
    }

  /**Using for clear search data */
  clear(){
    this.filterForm.controls['action'].setValue('');
    this.filterForm.controls['sort'].setValue('');
    this.getActivityLogs(this.current);
  }





















  showPreviousData(){
    this.$modal = new window.bootstrap.Modal(
        document.getElementById("displayPreviousData")
      );
      this.$modal.show();
  }

  showchangedData(){
    this.$modal = new window.bootstrap.Modal(
        document.getElementById("displayNewData")
      );
      this.$modal.show();
  }
}

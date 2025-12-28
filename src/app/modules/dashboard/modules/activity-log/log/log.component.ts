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

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {
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
  toggleFilter:boolean = false;

   moduleOptions = [
    { label: 'All', value: '' },
    { label: 'Announcement', value: 'ANNOUNCEMENT' },
    { label: 'Authentication', value: 'AUTHENTICATION' },
    { label: 'Blog', value: 'BLOG' },
    { label: 'Community', value: 'COMMUNITY' },
    { label: 'Community Settings', value: 'COMMUNITY_SETTINGS' },
    { label: 'Community Management', value: 'COMMUNITY_MANAGEMENT' },
    { label: 'Members', value: 'MEMBERS' },
    { label: 'Event Memory', value: 'EVENT_MEMORY' },
    { label: 'Event', value: 'EVENT' },
    { label: 'Event Payment', value: 'EVENT_PAYMENT' },
    { label: 'Event Supplier', value: 'EVENT_SUPPLIER' },
    { label: 'Event Supplier Log', value: 'EVENT_SUPPLIER_LOG' },
    { label: 'Event Task', value: 'EVENT_TASK' },
    { label: 'Group', value: 'GROUP' },
    { label: 'Family Member', value: 'FAMILY_MEMBER' },
    { label: 'User', value: 'USER' },
  ];

  actionOptions = [
    { label: 'All', value: '' },
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
    { label: 'Log In', value: 'LOG_IN' },
    { label: 'Payment Update', value: 'PAYMENT_UPDATE' },
    { label: 'Status Change', value: 'STATUS_CHANGE' },
    { label: 'Onboard', value: 'ONBOARD' },
    { label: 'Profile Update', value: 'PROFILE_UPDATE' },
    { label: 'Export', value: 'EXPORT' },
    { label: 'Cancel', value: 'CANCEL' },
    // { label: 'Update RSVP', value: 'UPDATE_RSVP_ADMINControll' },
    { label: 'Pubicity Page Status Change', value:'PUBLICITY_PAGE_STATUS_CHANGE'},
    { label: 'Promotion', value:'PROMOTION'},
    { label: 'Demotion', value:'DEMOTION'},
    { label: 'Payment Delete', value:'PAYMENT_DELETE'},
    { label: 'Event Reminder', value:'UPDATE_RSVP_ADMINCONTROLL'},
    { label: 'Add Member', value:'ADD_MEMBER'},
    { label: 'Leave Group', value:'LEAVE_GROUP'},
    { label: 'Update Community Settings', value:'UPDATE_COMMUNITY_SETTINGS'},
    { label: 'SMS Email Update', value:'SMS_EMAIL_UPDATE'},
    { label: 'Switch Community', value:'SWITCH_COMMUNITY'},
    { label: 'Export GROUP Wise', value:'EXPORT_GROUP_WISE'},
    { label: 'Export Family Wise', value: 'EXPORT_FAMILY_WISE'},
    { label: 'Update Quantity', value: 'UPDATE_QUANTITY' },
    { label: 'Assign Member', value: 'ASSIGNMEMBER' },
    { label: 'Delete Assign Member', value: 'DELETE_ASSIGN_MEMBER' },
    { label: 'Resend Invitation', value: 'RESENDINVITATION' },

  ];

  roleOptions = [
    {label: 'All', value: ''},
    {label: 'Board Member	', value: 'board_member'},
    {label: 'Executive Member', value: 'executive_member'},
    {label: 'Member', value: 'member'},
    {label: 'Fan', value: 'fan'},
  ]

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
      platForm: "web",
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
    this.filterForm.controls['module'].setValue('');
    this.getActivityLogs(this.current);
  }

}

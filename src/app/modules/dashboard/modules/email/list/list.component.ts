import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import { MailTabComponent } from '../mail-tab/mail-tab.component';
import { FormControl, FormGroup } from '@angular/forms';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { Subscription } from 'rxjs';
declare var window:any;
// import { MailingListComponent } from '../mailing-list/mailing-list.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit,OnDestroy {
  private mailSubscriber!: Subscription;
  private mailSendSubscriber!: Subscription;
  seachFilter:boolean = false;
  toggleFilter:boolean = false;
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  getListData: any;
  $readModal: any;
  getTemplateName!:string;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private commonService: CommonService,
    private mailList: MailTabComponent
  ){}

  ngOnInit(): void {
    this.commonService.getUrl().subscribe((page:any)=>{
      if(page){
        this.current = page
      }
      else{
        this.current = 1;
      }
    });
    this.generateSearchForm();
    this.getEmailList(this.current);
  }

  ngOnDestroy(): void {
    if(this.mailSubscriber){
      this.mailSubscriber.unsubscribe();
    }
    if(this.mailSendSubscriber){
      this.mailSendSubscriber.unsubscribe();
    }
  }

  /**Using for going to another */
  saveDetails(value: any) {
    if(value === 'next'){
     this.mailList.showMailList();
    }
  }

  /**Using for filter field show hide */
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

  /**Using for search field show hide */
  toggleSearch(){
    if( this.seachFilter === false){
      this.toggleFilter = false;
      this.seachFilter = true;
    }
    else{
      this.seachFilter = false;
    }
  }

  /**Used for reset filter data */
  ResetFilterData(){
    this.filterForm.controls['status'].setValue('');
    this.filterForm.controls['sortByName'].setValue('');
    this.getEmailList(this.current);
  }

  /**Using for declare the search form */
  generateSearchForm(){
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
    this.filterForm = new FormGroup({
      status: new FormControl(''),
      sortByName: new FormControl(''),
      // sortByDate: new FormControl('')
    });
  }

  /**Used for email send */
  sendEmail(mailtemplateId: string){
    const params: any = {};
    params['data']={
      mailtemplateId: mailtemplateId
    }
    this.loaderService.show();
    this.mailSendSubscriber = this.apolloClient.setModule("sendMailToMaillists").mutateData(params).subscribe((response: any) => {
      if (response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
      else {
        this.loaderService.hide();
        this.alertService.error(response.message);
        this.getEmailList(this.current);
      }
    });
  }

  /**Using for clear search data */
  clear(){
    this.searchForm.controls['search'].setValue('');
    this.getEmailList(this.current);
  }

  /**Using for email list */
  getEmailList(page:number){
    const params:any = {};
    params['data'] = {
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      page: page,
    }
    /**Used for search by template name */
    if(this.searchForm?.value.search && this.searchForm?.value.search!=''){
      params['data'].search = this.searchForm?.value.search.trim();
      params['data'].page = 1;
    }
    /**Used for sort by status*/
    if(this.filterForm?.value.status && this.filterForm?.value.status!=''){
      if(this.filterForm.value.status === "Draft"){
        params['data'].status = "Draft";
      }
      else if(this.filterForm.value.status === "Published"){
        params['data'].status = "Published";
      }
      else if(this.filterForm.value.status === "Publish"){
        params['data'].status = "Publish";
      }
    }
    /**Used for filter by template name */
    if(this.filterForm?.value?.sortByName && this.filterForm?.value?.sortByName!=''){
      if(this.filterForm?.value?.sortByName === 'descName'){
        params['data'].columnName = "TemplateName";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByName === 'ascName'){
        params['data'].columnName = "TemplateName";
        params['data'].sort = "asc";
      }
     }

    this.loaderService.show();
    this.mailSubscriber = this.apolloClient.setModule('getAllMailtemplates').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.getListData = response.data?.mailTemplates;
          this.totalData = response.data?.total;
          this.from = response.data?.from;
          this.to = response.data?.to;
          if(response.data.total !== 0) {
            this.totalPageNo = Math.ceil(response.data.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }
        }
      },
      error: err=>{
        console.log(err);
      }
    });  
    this.loaderService.hide();
  }

  /**Using for read more details */
  moreDetails(datails:any){
    this.$readModal = new window.bootstrap.Modal(
      document.getElementById("blogNameModal")
    );
    this.getTemplateName = datails.mailTemplateName;
    this.$readModal.show();
  }
  
  /**For belong to same page */
  onGoTo(page: number): void {
    this.current = page
    this.getEmailList(this.current);
  }

  /**For go to next page  */
  public onNext(page: number): void {
    this.current = page + 1;
    this.getEmailList(this.current);
  }

  /**For go to previous page  */
  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getEmailList(this.current);
  }

  /**Using For template edit */
  editTemplate(id: string){
    this.commonService.sendUrl(this.current);
    this.router.navigateByUrl(`email-template/template-edit/${id}`);
  }
}

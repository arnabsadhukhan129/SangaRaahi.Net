import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { CommonService } from '../../../services/common.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { MailTabComponent } from '../mail-tab/mail-tab.component';
import { FormControl, FormGroup } from '@angular/forms';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { Subscription } from 'rxjs';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { CsvService } from 'src/app/shared/services/csv.service';
declare var window:any;
import Swal from 'sweetalert2';
// import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-mailing-list',
  templateUrl: './mailing-list.component.html',
  styleUrls: ['./mailing-list.component.css']
})
export class MailingListComponent implements OnInit,OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  private mailListSubscriber!: Subscription;
  private fileSubscription!: Subscription;
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  getMailListData:any;
  seachFilter:boolean = false;
  toggleFilter:boolean = false;
  $modal: any;
  getFileName!: string;
  selectedFile: File | null = null;
  sortName: boolean = false;
  sortDate: boolean = false;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private commonService: CommonService,
    private mailList: MailTabComponent,
    private excelService: ExcelService,
    private csvService: CsvService
  ){}

  ngOnInit(): void {
    this.generateSearchForm();
    this.getEmailList(this.current);
  }

  ngOnDestroy(): void {
    if(this.mailListSubscriber){
      this.mailListSubscriber.unsubscribe();
    }
    if(this.fileSubscription){
      this.fileSubscription.unsubscribe();
    }
  }

 
  /**Using for going to another tab */
  saveDetails(value: any) {
    if(value === 'next'){
      this.mailList.showMailTempalte();
    }
  }

  /**Using for declare the search form */
  generateSearchForm(){
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
    this.filterForm = new FormGroup({
      sortByDate: new FormControl(''),
      sortByName: new FormControl('')
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
    if(this.searchForm?.value.search && this.searchForm?.value.search!=''){
      params['data'].search = this.searchForm?.value.search.trim();
      params['data'].page = 1;
    }
    if(this.filterForm?.value?.sortByDate && this.filterForm?.value?.sortByDate!=''){
      if(this.filterForm?.value?.sortByDate === 'descDate'){
        params['data'].columnName = "DateSort";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByDate === 'ascDate'){
        params['data'].columnName = "DateSort";
        params['data'].sort = "asc";
      }
    }
    if(this.filterForm?.value?.sortByName && this.filterForm?.value?.sortByName!=''){
      if(this.filterForm?.value?.sortByName === 'descName'){
        params['data'].columnName = "ContactName";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByName === 'ascName'){
        params['data'].columnName = "ContactName";
        params['data'].sort = "asc";
      }
    }
    this.loaderService.show();
    this.mailListSubscriber = this.apolloClient.setModule('getAllMailList').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.getMailListData = response.data?.mailList; 
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
      //this.clearDateFilter()
      this.toggleFilter = false;
      this.seachFilter = true;
    }
    else{
      this.seachFilter = false;
    }
  }

  /**Used for reset filter data */
  ResetFilterData(){
    this.filterForm.controls['sortByDate'].setValue('');
    this.filterForm.controls['sortByName'].setValue('');
    this.getEmailList(this.current);
  }

  /**Using for download xlsx file */
  downloadExcel(): void {
    let data:any[]=[];
    if(this.getMailListData.length > 1){
      this.getMailListData.forEach((element:any) => {
        data.push({
          contact_name: element.contactName ? element.contactName : 'N/A',
          contact_email: element.contactEmail ? element.contactEmail : 'N/A',
          phone_code: element.phoneCode ? element.phoneCode : 'N/A',
          phone_no: element.phoneNo ? element.phoneNo : 'N/A'
        })
      });
    }
    this.excelService.exportToExcel(data, 'Sample Mailing List Bulk Upload');
  }

  importFile(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("uploadFile")
    );
    this.$modal.show();
  }

  closeModal(){
    this.$modal.hide();
    this.getEmailList(this.current);
    this.removeFile();
  }

  //using for import data saved
  saveData() {
  if (this.selectedFile) {
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('communityId', this.storageService.getLocalStorageItem('communtityId'));

    this.loaderService.show();

    this.fileSubscription = this.csvService.importFilePost(formData).subscribe({
      next: (response) => {
        this.alertService.error(response.message);
        this.getEmailList(this.current);
        this.removeFile();
        this.loaderService.hide();
        this.$modal.hide();
      },
      error: (error) => {
        this.loaderService.hide();
        this.alertService.error(error.error.message);
      }
    });
  } else {
    this.alertService.error("no file selected!");
  }
}

  getFile(event: any){
    this.selectedFile = event.target.files[0];
    if(this.selectedFile){
      const extension = this.selectedFile.name.substr(this.selectedFile.name.lastIndexOf('.'));
      if((extension.toLowerCase() === '.xlsx') || (extension.toLowerCase() === '.xls') || (extension.toLowerCase() === '.xlsm') || (extension.toLowerCase() === '.xlsb') || (extension.toLowerCase() === '.xltx') || (extension.toLowerCase() === '.csv')){
        this.selectedFile = event.target.files[0];
      }
      else{
        this.alertService.error("Could allow to upload .xlsx,.xls,.xlsm,.xlsb,.xltx,.csv files");
        this.selectedFile = null;
        return;
      }
    }
  }

  removeFile(){
    this.fileInput.nativeElement.value = null;
    this.selectedFile = null;
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

   /** Using for blog delete */
   deleteBlog(mailId:any,index:any){
    Swal.fire({
      title: 'Are you sure you want to delete this contact?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        this.removeRow(mailId, index);
      }
    })
    }
  
    /**Using for remove row after delete */
    removeRow(mailId:any,index:any){
      const params:any= {};
      params['data'] = {
        mailId : mailId,
      }
      this.loaderService.show();
      this.apolloClient.setModule('deleteMailList').mutateData(params).subscribe((response: any) => {
        this.loaderService.hide();
        if(response.error) {
          this.alertService.error(response.message);
        } 
        else {
          this.alertService.success(response.message);
          this.getMailListData.splice(index,1);
          if(this.getMailListData.length === 0){
            this.onPrevious(this.current);
          }
          else{
            this.getEmailList(this.current);
          }
        }
      });
    }

}

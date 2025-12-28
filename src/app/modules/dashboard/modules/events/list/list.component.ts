import {  Component, OnInit, Output, EventEmitter, OnDestroy, DoCheck} from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Event } from 'src/app/shared/models/events.model';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { paramService } from 'src/app/shared/params/params';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {eventCountResult} from 'src/app/shared/models/event-count-details.modal';
import {CsvService} from 'src/app/shared/services/csv.service';
import { HttpResponse } from '@angular/common/http';
import { CommonService } from '../../../services/common.service';
declare var window:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit,DoCheck,OnDestroy  {

  private countingSubscriber!: Subscription;
  
  evetList: Event[] = [];
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
  eventId!: string;
  getCountData: eventCountResult = {};
  getCurrency: string = "";
  getCommunityName!: string;
  $readModal: any
  getEventName!: string;
  sortName: boolean = false;
  sortDate: boolean = false;
  getEventDetails: any;
  $frequencyModal: any;
  getEventId!: string;
  frequencyStatus!: string;
  isSearchAction:boolean = false;
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
    public csvService: CsvService,
    private commonService: CommonService
  )
  {
    this.getCurrency = this.storageService.getLocalStorageItem('currency');
    this.getCommunityName = this.storageService.getLocalStorageItem('communityName');
    this.commonService.sendSearch("no search");
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getEventDetails = saveRole?.event;
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
    this.getCountingValue();
    //this.events();
  }

  ngDoCheck(): void {
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getEventDetails = saveRole?.event;
  }

  ngOnDestroy(): void {
    if(this.countingSubscriber){
      this.countingSubscriber.unsubscribe()
    }
  }

  generateSearchForm() {
    this.filterForm = new FormGroup({
      status: new FormControl(''),
      sortByDate: new FormControl(''),
      sortByName: new FormControl('')
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

//  getEventList(id: any, page: Number) {
//   const searchData = this.activatedRoute.snapshot.paramMap.get("value") ? this.activatedRoute.snapshot.paramMap.get("value") : '';
//   const params: any = {};
//   params['data'] = {
//     communityId: id,
//     page: page,
//     // limit: this.limit,
//     //eventType: "Past",
//     isActive: null
//   };

//   if (searchData) {
//     params['data'].search = searchData.trim();
//     params['data'].page = 1;
//   }

//   if (this.searchForm.value.search && this.searchForm.value.search !== '') {
//     params['data'].search = this.searchForm.value.search.trim();
//     params['data'].page = 1;
//   }

//   if (this.filterForm.value.status && this.filterForm.value.status !== '') {
//     if (this.filterForm.value.status === 'cancelled') {
//       params['data'].isCancelled = true;
//     } else {
//       params['data'].isActive = this.filterForm.value.status;
//     }
//   }

//   if (this.filterForm.value.sortByDate && this.filterForm.value.sortByDate !== '') {
//     params['data'].columnName = "DateSort";
//     params['data'].sort = this.filterForm.value.sortByDate === 'descDate' ? 'desc' : 'asc';
//   }

//   if (this.filterForm.value.sortByName && this.filterForm.value.sortByName !== '') {
//     params['data'].columnName = "EventName";
//     params['data'].sort = this.filterForm.value.sortByName === 'descName' ? 'desc' : 'asc';
//   }

//   // Show loader before the data request
//   // this.loaderService.show();

//   this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe((response: GeneralResponse) => {
//     if (response.error) {
//       this.alertService.error(response.message);
//     } else {
//       this.evetList = response.data.events;
//       this.totalData = response.data.total;
//       this.from = response.data?.from;
//       this.to = response.data?.to;

//       if (response.data.total !== 0) {
//         this.totalPageNo = Math.ceil(response.data.total / this.limit);
//       } else {
//         this.totalPageNo = 0;
//       }
//     }
//     // Hide the loader only after the data has been received and processed
//     this.loaderService.hide();
//   }, (error) => {
//     // Handle error case and hide the loader
//     this.alertService.error('Failed to load events.');
//     this.loaderService.hide();
//   });
// }


getEventList(id: any, page: number) {
  this.isSearchAction = false;
  const searchData = this.activatedRoute.snapshot.paramMap.get("value") 
    ? this.activatedRoute.snapshot.paramMap.get("value") 
    : '';
  const params: any = {};
  // let isSearchAction = false; // Flag to determine if this is a search action

  params['data'] = {
    communityId: id,
    page: page,
    isActive: null
  };

  if (searchData) {
    params['data'].search = searchData.trim();
    params['data'].page = 1;
    this.isSearchAction = true;
  }

  if (this.searchForm.value.search && this.searchForm.value.search !== '') {
    params['data'].search = this.searchForm.value.search.trim();
    params['data'].page = 1;
    this.isSearchAction = true;
  }

  if (this.filterForm.value.status && this.filterForm.value.status !== '') {
    if (this.filterForm.value.status === 'cancelled') {
      params['data'].isCancelled = true;
    } else {
      params['data'].isActive = this.filterForm.value.status;
    }
  }

  if (this.filterForm.value.sortByDate && this.filterForm.value.sortByDate !== '') {
    params['data'].columnName = "DateSort";
    params['data'].sort = this.filterForm.value.sortByDate === 'descDate' ? 'desc' : 'asc';
  }

  if (this.filterForm.value.sortByName && this.filterForm.value.sortByName !== '') {
    params['data'].columnName = "EventName";
    params['data'].sort = this.filterForm.value.sortByName === 'descName' ? 'desc' : 'asc';
  }

  // Only show loader for non-search actions
  if (!this.isSearchAction) {
    this.loaderService.show();
  }

  this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe(
    (response: GeneralResponse) => {
      if (response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
      } else {
        if (!this.isSearchAction) {
          this.loaderService.hide();
        }
        this.evetList = response.data.events;
        this.totalData = response.data.total;
        this.from = response.data?.from;
        this.to = response.data?.to;

        if (response.data.total !== 0) {
          this.totalPageNo = Math.ceil(response.data.total / this.limit);
        } else {
          this.totalPageNo = 0;
        }
      }
      // Always hide the loader after processing
     
    },
    (error) => {
      // Handle error case
      this.alertService.error('Failed to load events.');
      if (!this.isSearchAction) {
        this.loaderService.hide();
      }
    }
  );
}


  public onGoTo(page: number): void {
    this.current = page
    this.getEventList(this.communityId, this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getEventList(this.communityId, this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getEventList(this.communityId, this.current);
  }

  public back()
  {
    this.paramService.updatecurrentRoute('/dashboard');
    this.router.navigateByUrl('/dashboard');
  }

  changeStatus(eventId:any,index:any){
    const params:any= {};
    params['myCommunityEventStatusChangeId'] = eventId;

    this.loaderService.show();

    this.apolloClient.setModule('myCommunityEventStatusChange').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        //this.evetList[index].isActive = !this.evetList[index].isActive;
        if(this.evetList[index].isActive === 'active')
        {
           this.evetList[index].isActive = 'inactive';
        }
        else if(this.evetList[index].isActive === 'inactive')
        {
           this.evetList[index].isActive = 'active';
        }
        this.alertService.success(response.message);
      }
    });
  }


  editEvent(eventId:any,status:any)
  {
      if(status === 'past')
      {
            Swal.fire({
              title: 'You cant edit past event',
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
          this.router.navigateByUrl(`events/edit/${eventId}`);
      }
  }

  paymentWiseEvent(eventId:any){
    this.commonService.sendUrl(this.current);
    this.router.navigateByUrl(`events/payment-history-list/${eventId}`);
  }

  deleteEvent(eventId:any,index:any){
    Swal.fire({
      // title: 'Are you sure you want to delete this event?',
      title: 'Are you sure you want to cancel this event?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        // this.removeRow(eventId, index);
        this.cancelEvent(eventId,index)
      }
    })
  }

  cancelEvent(eventId:any,index:number){
    const params:any= {};
    params['data'] = {
      id: eventId
    };

    this.loaderService.show();
    this.apolloClient.setModule('cancelEvent').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        // this.evetList.splice(index,1);
        // this.alertService.success(response.message);
        // if(this.evetList.length === 0){
        //   this.onPrevious(this.current);
        // }
        // else{
          this.getEventList(this.communityId,this.current);
        // }
      }
    });
  }

  removeRow(eventId:any,index:any){
    const params:any= {};
    params['myCommunitydeleteEventId'] = eventId;

    this.loaderService.show();
    this.apolloClient.setModule('myCommunitydeleteEvent').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.evetList.splice(index,1);
        this.alertService.success(response.message);
        if(this.evetList.length === 0){
          this.onPrevious(this.current);
        }
        else{
          this.getEventList(this.communityId,this.current);
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
    this.getEventList(this.communityId,this.current);
  }

  displayEventDetail(eventId : string){

    this.eventId = eventId;   

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

   /**Using for get the count value */
   getCountingValue(){
    const params:any={};
    params['data'] = {
      eventId: this.eventId
    }
    this.loaderService.show();
    this.countingSubscriber = this.apolloClient.setModule('getEventsCardDetails').queryData(params).subscribe({
      next: (response: GeneralResponse) =>{
        if(response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.getCountData = response.data;
          this.getEventList(this.communityId, this.current);
        }
      },
      error: err=>{
        this.loaderService.hide();
        console.log(err);
      }
    })
  }

  /**get event data for export to csv */
  events() {
    this.loaderService.show();
  
    this.csvService.getReq(this.communityId).subscribe(
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
          const defaultFilename = 'event-list';
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

   /**Using for read more details */
   moreDetails(datails:any){
    this.$readModal = new window.bootstrap.Modal(
      document.getElementById("eventNameModal")
    );
    this.getEventName = datails.title;
    this.$readModal.show();
  }

  /**Using For Frequency Settings Modal Show */
  showFrequencyModal(eventId:any){
    this.$frequencyModal = new window.bootstrap.Modal(
      document.getElementById("frquencyModal")
    );
    this.getEventId = eventId;
    this.$frequencyModal.show();
  }

  /**Using For Frequency Settings Modal Hide */
  closeModal(){
    this.$frequencyModal.hide();
  }


  /**Using For Settings Frequency */
  frequencySettings(eventId:any, status: string){
    this.$frequencyModal.hide();
    this.commonService.sendUrl(this.current);
    this.router.navigateByUrl(`events/reminder/${eventId}/${status}`);
  }

}

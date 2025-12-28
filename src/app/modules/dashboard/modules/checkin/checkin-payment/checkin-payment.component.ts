import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/shared/services/socket.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkin-payment',
  templateUrl: './checkin-payment.component.html',
  styleUrls: ['./checkin-payment.component.css']
})
export class CheckinPaymentComponent implements OnInit, OnDestroy, DoCheck {
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  getCheckInPaymentList: any;
  checkinPaymentSubscriber!: Subscription;
  paymentStatusSubscriber!: Subscription;
  eventId: any;
  $modal: any;
  seachFilter: boolean = false;
  searchForm!: FormGroup;
  getCheckinDetail!: any;
  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private commonService: CommonService,
    private socketService: SocketService,
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
    this.checkinPaymentSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.eventId = params.get('eventId');
        this.socketService.eventConnection(this.eventId);
        this.socketService.listen('check_in_event').subscribe((data: any) => {
          console.log("payment socket data------",data);
          
          if(data.type === 'checkIn_update'){
            const index = this.getCheckInPaymentList.findIndex((item: any) => item.id === data.id);
            if (index !== -1) {
              this.getCheckInPaymentList[index].checkIn = data.checkIn;
            }
          }
          if(data.type === 'payment_update'){
            // console.log("hiii....");
            
            const index = this.getCheckInPaymentList.findIndex((item: any) => item.id === data.id);
            // console.log("index-----",index);
            if (index !== -1) {
              // this.getCheckInPaymentList[index].checkIn = data.checkIn;
              this.getCheckInPaymentList[index].rsvpStatus = "paid";
            }
          }
        });
        // this.getList(this.current);
      },
      error: err => {}
    });
    this.generateSearchForm();
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getCheckinDetail = saveRole?.checkin;
    this.getList(this.current);
  }

  ngDoCheck(): void {
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getCheckinDetail = saveRole?.checkin;
  }

  /**Using for declare the search form */
  generateSearchForm(){
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  ngOnDestroy(): void {
    if(this.checkinPaymentSubscriber){
      this.checkinPaymentSubscriber.unsubscribe();
    }
    if(this.paymentStatusSubscriber){
      this.paymentStatusSubscriber.unsubscribe();
    }
  }

  getList(page:number){
    const params:any = {};
    params['data'] = {
      eventId: this.eventId
    }
    // console.log("search======", this.searchForm?.value.search);
    
    if(this.searchForm?.value.search && this.searchForm?.value.search!=''){
      params['data'].search = this.searchForm?.value.search.trim();
      params['data'].page = 1;
    }
    this.loaderService.show();
    this.apolloClient.setModule('getAllEventPayment').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
          this.getCheckInPaymentList = response?.data?.payment;
          //  console.log('-------------', this.getCheckInPaymentList);
          this.totalData = response?.data?.total;
          this.from = response?.data?.from;
          this.to = response?.data?.to;
          if(response?.data?.total !== 0) {
            this.totalPageNo = Math.ceil(response?.data?.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }     
        }
    });

    this.loaderService.hide();
  }

   /**Using for current page */
   onGoTo(page: number): void {
    this.current = page;
    this.getList(this.current);
    }
  
    /**Using for move to next page */
    onNext(page: number): void {
    this.current = page + 1;
    this.getList(this.current);
    }
  
    /**Using for move to current page */
    onPrevious(page: number): void {
    this.current = page - 1;
    this.getList(this.current);
    }

    togglePermanentStatus(event: any, index:number, paymentId:any){
      const params:any={};
      params['data'] = {
        paymentId: paymentId
      };
      this.loaderService.show();
      this.paymentStatusSubscriber = this.apolloClient.setModule('updateCheckIn').mutateData(params).subscribe({
        next: (response: GeneralResponse)=> {
          if(response.error) {
            this.alertService.error(response.message);
            return;
          }
          else{
            if(this.getCheckInPaymentList[index].checkIn === false || this.getCheckInPaymentList[index].checkIn === null){
              this.getCheckInPaymentList[index].checkIn = true;
            }
            // Emit the change via socket so other clients get updated
            // this.socketService.emit('check_in_event', {
            //   user_id: this.storageService.getLocalStorageItem('userId'),
            //   event_id: this.eventId,
            //   checkIn: this.getCheckInPaymentList[index].checkIn
            //   // check_in_event: this.getCheckInPaymentList[index].checkIn
            // });
            this.alertService.success(response.message);
            this.getList(this.current);          
          }
        },
        error: err=> {
          console.log(err);
        }
      });
      this.loaderService.hide();
    }

    payLink(id:any){
      this.router.navigateByUrl('/events/payment-history-list/'+this.eventId+'/'+1+'/'+id);
    }

    searchToggle(){
      if(!this.seachFilter){
        this.seachFilter = true;
      }
      else{
        this.seachFilter = false;
      }
    }

    clear(){
      this.searchForm.controls['search'].setValue('');
      this.getList(this.current);
    }
}

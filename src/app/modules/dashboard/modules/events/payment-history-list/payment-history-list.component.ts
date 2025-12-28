import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { paramService } from 'src/app/shared/params/params';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { PaymentHistory, SinglePaymentDetails } from 'src/app/shared/models/payment-history.model';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {paymentCountResult} from 'src/app/shared/models/payment-count-details.modal';
import { StorageService } from 'src/app/shared/services/storage.service';
import {CsvService} from 'src/app/shared/services/csv.service';
import { HttpResponse } from '@angular/common/http';
import { PaymentService } from 'src/app/shared/services/payment.service';
import { SocketService } from 'src/app/shared/services/socket.service';
declare var window: any;


@Component({
  selector: 'app-payment-history-list',
  templateUrl: './payment-history-list.component.html',
  styleUrls: ['./payment-history-list.component.css']
})
export class PaymentHistoryListComponent implements OnInit, OnDestroy {
  @ViewChild('transactionAmount') transactionAmount!: ElementRef;
  private eventIdSubscriber!: Subscription;
  private countingSubscriber!: Subscription;
  private paySubscriber!: Subscription;
  eventId: any;
  eventPaymentId: any;
  // paymentList: PaymentHistory[] = [];
  paymentList: any;
  current: number = 1;
  limit: number = 10;
  $payment_model: any;
  getEventPaymetValue: any;
  // singlePaymentDetails: SinglePaymentDetails[] = [];
  singlePaymentDetails: any;
  totalData!: any;
  totalPageNo!: number;
  from: any;
  to: any;
  paymentMode = ["Cash", "Check", "Zelle", "Paypal"];
  paymentSubmitForm !: FormGroup;
  updateFormPaymentId!: string;
  checkboxCheck: any;
  paymentEventDetails!: any;
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  showSearchInput: boolean = false;
  chargeCost: number = 0;
  paymentAmount!: number;
  paymentId: any
  getCountData: paymentCountResult = {};
  getCurrency: string = "";
  payAmount: any;
  donation!: number;
  concesion!: number;
  changePaymentStatus: boolean = false;
  rsvpVal!: string;
  payId: any;
  idFilter: any;
  toggleFilter: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private paramService: paramService,
    private loaderService: LoaderService,
    private builder: FormBuilder,
    private router: Router,
    private storageService: StorageService,
    private csvService: CsvService,
    private paymentService: PaymentService,
    private socketService: SocketService,
  ) {
    this.getCurrency = this.storageService.getLocalStorageItem('currency');
   }

  ngOnInit(): void {
    this.eventPaymentId = this.activatedRoute.snapshot.params['id'];
    this.payId = this.activatedRoute.snapshot.params['pay'];
    if (this.eventPaymentId) {
      if(this.payId){
        this.idFilter = this.activatedRoute.snapshot.params['payId'];
        this.getPaymentList(this.eventPaymentId,this.current,this.idFilter);
      }
      else{
        this.getPaymentList(this.eventPaymentId, this.current);
        this.getPaymentModuleName(this.eventPaymentId)
      }
    }

    this.eventIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.eventId = params.get('id');
        this.socketService.eventConnection(this.eventId);
          this.socketService.listen('check_in_event').subscribe((data: any) => {
            // console.log("data=====", data.type);
            if(data.type === "payment_update"){
              this.router.navigateByUrl('check-in/checkin-payment/'+this.eventId);
            }
          });
      },
      error: err => { }
    });
    
    this.countNum();
    this.paymentSubmitForm = this.builder.group({
      paymentId: this.updateFormPaymentId,
      rsvpStatus: [''],
      paymentDetails: this.builder.group({
        actualPaymentmtount: [''],
        checkNo: [''],
        description: [''],
        gatewayChargeCost: [0],
        paymentMode: ['',Validators.required],
        //paymentStatus: [true],
       // transactionAmount: [],
        transactionId: [''],
      }),
    });
    // Listen for changes in the paymentMode control
    this.paymentSubmitForm.get('paymentDetails.paymentMode')?.valueChanges.subscribe((mode) => {
      // Check if the mode is not 'Check', then clear the checkNo value
      if (mode !== 'Check') {
        this.paymentSubmitForm.get('paymentDetails.checkNo')?.reset('');
      }
      if (mode !== 'Paypal' || mode !== 'Zelle') {
        this.paymentSubmitForm.get('paymentDetails.transactionId')?.reset('');
      }
    });
    this.getCountingValue();
    this.generateSearchForm();
  }

  //** SEARCH FUNCTION */
  generateSearchForm() {
    this.filterForm = new FormGroup({
      accessPlatfrom: new FormControl('')
    });

    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  //**clear search form */
  clearDateFilter() {
    this.filterForm.controls['accessPlatfrom'].setValue('');
    this.searchForm.controls['search'].setValue('');
    this.current = 1;
    this.getPaymentList(this.eventPaymentId, this.current)
  }

  public back() {
    this.router.navigateByUrl('/events');
  }


  ngOnDestroy(): void {
    if (this.eventIdSubscriber) {
      this.eventIdSubscriber.unsubscribe();
    }
    if(this.countingSubscriber){
      this.countingSubscriber.unsubscribe()
    }
    if(this.paySubscriber){
      this.paySubscriber.unsubscribe();
    }
  }

  countNum() {
    const counters = document.querySelectorAll(".counter");
    //console.log(counters);
    counters.forEach((counter: any) => {
      counter.innerText = "0";
      const updateCounter = () => {
        const target = +counter.getAttribute("data-target");
        const count = +counter.innerText;
        const increment = target / 2000;
        if (count < target) {
          counter.innerText = `${Math.ceil(count + increment)}`;
          setTimeout(updateCounter, 1);
        } else counter.innerText = target;
      };
      updateCounter();
    });
  }

  /**Using for redirect to task management list*/
  redirectToEvent() {
    this.router.navigateByUrl('events/task-management-list/' + this.eventId);
  }

  /**Using for redirect to Supply management list*/
  redirectToSupplyList() {
    this.router.navigateByUrl('events/supply-management/list/' + this.eventId);
  }

  /**Using for redirect to Event memory list*/
  redirectToEventMemory() {
    this.router.navigateByUrl('events/memory-management/event-memory-list/' + this.eventId);
  }

  //** get payment module name */
  getPaymentModuleName(id: any) {
    const params: any = {};
    params['getMyCommunityEventByIdId'] = id;

    // this.loaderService.show();

    this.apolloClient.setModule('getMyCommunityEventByID').queryData(params).subscribe({
      next: (res: GeneralResponse) => {
        this.paymentEventDetails = res?.data
      },
      error: (err) => {
        console.log(err);
      }
    });

    // this.loaderService.hide();
  }

  //**get payment listing */
  getPaymentList(id: any, page: Number, idFilter:any=null) {
    console.log("search......",idFilter);
    
    const params: any = {};
    params['data'] = {
      eventId: id,
      page: page
    }

    if(idFilter){
      params['data'].idFilter = idFilter;
    }
    if(this.searchForm?.value?.search && this.searchForm?.value?.search!=''){
      params['data'].search = this.searchForm?.value?.search.trim();
    }

    if (this.filterForm?.value?.accessPlatfrom && this.filterForm?.value?.accessPlatfrom !== '') {
        params['data'].accessPlatfrom = this.filterForm?.value?.accessPlatfrom;
    }

    this.loaderService.show();

    this.apolloClient.setModule('getAllEventPayment').queryData(params).subscribe({
      next: (res: GeneralResponse) => {
        //this.loaderService.hide();
        this.paymentList = res?.data?.payment;
        this.totalData = res?.data.total;
        this.from = res.data?.from;
        this.to = res.data?.to;
        // console.log(this.totalData, "<--------------------data-Resp");
        if (res?.data.total !== 0) {
          this.totalPageNo = Math.ceil(res?.data.total / this.limit);
        } else {
          this.totalPageNo = 0;
        }
      },
      error: (err) => {
        console.log(err);
        //this.loaderService.hide();
      }
    });

    this.loaderService.hide();
  }


  //** Get Single Pyament Details */
  getEventPaymentById(id: any) {
    // console.log(id, "sng pay id ");

    const params: any = {};
    params['data'] = {
      paymentId: id
    }
    this.apolloClient.setModule('getEventPaymentById').queryData(params).subscribe({
      next: (res: GeneralResponse) => {
        this.singlePaymentDetails = res?.data
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  /** modal for click on payment in table list --- show in modal*/
  payment_model(getData: any, paymentId: string) {
    this.updateFormPaymentId = paymentId;
    this.$payment_model = new window.bootstrap.Modal(
      document.getElementById("single_payment_modal")
    );
    this.getEventPaymentById(paymentId)
    this.$payment_model.show();
    // this.getEventPaymetValue = getData;
    // this.taskId = taskId;
  }


  //**Payment submit model */
  payment_submit_model(id: any, amount:any, event: any, payId:any) {
    this.checkboxCheck = event;
    this.$payment_model = new window.bootstrap.Modal(
      document.getElementById("payment_form_modal")
    );

    // Set the paymentId value in the form
    this.paymentSubmitForm.patchValue({
      paymentId: id, // Assuming id is the value you want to assign
    });
    this.getEventPaymentById(id);
    this.paymentId = payId;
    //this.paymentEventDetails.actualPaymentmtount
    this.payAmount = amount;
    // console.log("actualPaymentmtount.....",this.payAmount);
    
    // this.paymentSubmitForm.patchValue({
    //   paymentDetails: {
    //     actualPaymentmtount: this.payAmount
    //   }
    // });
    this.$payment_model.show();
    // this.getEventPaymetValue = getData;
    // this.taskId = taskId;
  }

  cal(){
    if(this.payAmount === this.paymentAmount){
      this.donation = 0;
      this.concesion = 0;
      this.transactionAmount.nativeElement.value = this.paymentAmount - this.donation - this.chargeCost;
    }  
    else if(this.paymentAmount > this.payAmount){
      this.donation = this.paymentAmount - this.payAmount;
      this.concesion = 0;
      this.transactionAmount.nativeElement.value = this.paymentAmount - this.donation - this.chargeCost;
      
    }  
    else if(this.paymentAmount < this.payAmount){
      this.donation = 0;
      this.concesion = this.payAmount - this.paymentAmount;
      this.transactionAmount.nativeElement.value = this.payAmount - this.concesion - this.chargeCost;
     
    }  
  }
  
  //** on submit */
  onSubmit() {
    console.log("payId======",this.payId);
    
      if(this.paymentSubmitForm.value.paymentDetails.actualPaymentmtount === null || this.paymentSubmitForm.value.paymentDetails.actualPaymentmtount === '' || this.paymentSubmitForm.value.paymentDetails.actualPaymentmtount === undefined){
        this.alertService.error("Customer Payment Amount is required");
        return;
      }
      if(this.changePaymentStatus){
        if(this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost === null || this.paymentSubmitForm.value.paymentDetails?.gatewayChargeCost === '' || this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost === undefined || this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost === 0){
          this.alertService.error("Gateway Charge Amount is required");
          return;
        }
      }
      if(this.paymentSubmitForm.value.paymentDetails.paymentMode === null || this.paymentSubmitForm.value.paymentDetails?.paymentMode === '' || this.paymentSubmitForm.value.paymentDetails.paymentMode === undefined){
        this.alertService.error("Please select the payment mode");
        return;
      }
      if(this.paymentSubmitForm.value.paymentDetails.paymentMode === "Paypal" || this.paymentSubmitForm.value.paymentDetails.paymentMode === "Zelle"){
        if(this.paymentSubmitForm.value.paymentDetails.transactionId === null || this.paymentSubmitForm.value.paymentDetails.transactionId === "" || this.paymentSubmitForm.value.paymentDetails.transactionId === undefined){
          this.alertService.error("Transaction id is required");
          return;
        }
      }
      if(this.paymentSubmitForm.value.paymentDetails.paymentMode === "Check"){
        if(this.paymentSubmitForm.value.paymentDetails.checkNo === null || this.paymentSubmitForm.value.paymentDetails.checkNo === "" || this.paymentSubmitForm.value.paymentDetails.checkNo === undefined){
          this.alertService.error("Check no is required");
          return;
        }
      }
      // if(this.paymentSubmitForm.value.paymentDetails.description === null || this.paymentSubmitForm.value.paymentDetails?.description === '' || this.paymentSubmitForm.value.paymentDetails.description === undefined){
      //   this.alertService.error("Description is required");
      //   return;
      // }
      if(this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost < 0){
        this.alertService.error("gateway charge amount can not be a negative value");
        return;
      }
      if(this.paymentSubmitForm.value.paymentDetails.actualPaymentmtount < 0){
        this.alertService.error("customer payment amount can not be a negative value");
        return;
      }
      if(this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost > this.paymentSubmitForm.value.paymentDetails.actualPaymentmtount){
        this.alertService.error("community received amount can not be a negative value");
        return;
      }
      if(this.rsvpVal === "" || this.rsvpVal === null || this.rsvpVal === undefined){
        this.alertService.error("Payment Status is required");
        return;
      }
      // console.log("paymentSubmitForm.....",this.rsvpVal);
      // return;
      let params: any = {};
      params['data'] = {
        ...this.paymentSubmitForm.value,
          paymentDetails:{
            actualPaymentmtount: this.paymentSubmitForm.value.paymentDetails?.actualPaymentmtount,
            checkNo: this.paymentSubmitForm.value.paymentDetails?.checkNo,
            description: this.paymentSubmitForm.value.paymentDetails?.description,
            gatewayChargeCost: this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost ? this.paymentSubmitForm.value.paymentDetails.gatewayChargeCost : 0,
            paymentMode: this.paymentSubmitForm.value.paymentDetails?.paymentMode,
            transactionId: this.paymentSubmitForm.value.paymentDetails?.transactionId,
            transactionAmount: parseInt(this.transactionAmount.nativeElement.value),
            donationAmount: this.donation ? this.donation : 0,
            concessionAmount: this.concesion ? this.concesion : 0,
            accessPlatfrom: "web"
          },
          rsvpStatus: this.rsvpVal,
      }      
      this.loaderService.show();
      this.$payment_model.hide();
      this.apolloClient.setModule('updateEventPayment').mutateData(params).subscribe({
        next: (res: any) => {
          this.loaderService.hide();
          // console.log(res, "<-------resp");
          // this.$payment_model.hide();
          if(this.payId){
            this.$payment_model.hide();
            this.router.navigateByUrl('check-in/checkin-payment/'+this.eventId);
          }
          else{
            this.getPaymentList(this.eventPaymentId, this.current);
          }
          
          this.alertService.success(res.message);
        },
        error: (err) => {
          console.log(err);
          this.loaderService.hide();
          this.alertService.error(err.message);
          // this.$payment_model.hide();
        }
      })
    //   const paymentDetails = this.paymentSubmitForm.get('paymentDetails').value;
    // console.log(paymentDetails);

  }

  //**pagination funnctions Start */
  public onGoTo(page: number): void {
    this.current = page
    this.getPaymentList(this.eventPaymentId, this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getPaymentList(this.eventPaymentId, this.current);

  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getPaymentList(this.eventPaymentId, this.current);

  }
  //**pagination funnctions End */

  //** Paid status update */ not useing now
  // changePaymentStatusAlert(event: any, id: string) {
  //   Swal.fire({
  //     title: 'Are you sure you want to change this payment status?',
  //     text: '',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Ok',
  //     cancelButtonText: 'Cancel'
  //   }).then((result) => {
  //     // if(result.value){
  //     //   this.changePaymentStatus(id);
  //     // }
  //     if (result.dismiss === Swal.DismissReason.cancel) {
  //       // If Cancel clicked, uncheck the checkbox
  //       event.target.checked = false;
  //     } else if (result.value) {
  //       event.target.disabled = true;
  //       this.changePaymentStatus(id);
  //     }
  //   })
  // };
  //** Paid status update api calling */
  // changePaymentStatus(paymentId: any) {
  //   const params: any = {};
  //   params['data'] = {
  //     paymentId: paymentId,
  //     rsvpStatus: "paid"
  //   }

  //   this.loaderService.show();
  //   this.apolloClient.setModule('updateEventPayment').mutateData(params).subscribe({
  //     next: (res: any) => {
  //       this.loaderService.hide();
  //       // console.log(res, "<-------resp");
  //       this.alertService.success(res.message)
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       this.alertService.error(err.message)
  //     }
  //   })
  // };

  deleteEvent(paymentId: any) {
    Swal.fire({
      title: 'Are you sure you want to delete this payment ?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {

        const params: any = {};
        params['data'] = {
          paymentId: paymentId
        }

        this.loaderService.show();
        this.apolloClient.setModule('deleteEventPayment').mutateData(params).subscribe({
          next: (res: any) => {
            this.loaderService.hide();
            // console.log(res, "<-------resp");
            this.getPaymentList(this.eventPaymentId, this.current);
            this.alertService.success(res.message)
          },
          error: (err) => {
            console.log(err);
            this.alertService.error(err.message)
          }
        })
      }

    })
  }

  /**Using for close the  modal */
  closeModal(event: any) {
    this.paymentSubmitForm.reset();
    this.donation = 0;
    this.concesion = 0;
    this.transactionAmount.nativeElement.value = '';
    this.checkboxCheck.target.checked = false
    this.$payment_model.hide();
    this.paymentSubmitForm?.get('paymentDetails')?.get('paymentMode')?.setValue('');
    // this.paymentSubmitForm?.get('paymentDetails')?.get('paymentStatus')?.setValue(true);
    // this.otpSubmissionForm.controls['otp'].setValue('');
  }

  clearPaymentMode() {
    this.paymentSubmitForm.controls['paymentDetails.checkNo'].setValue('')
  }

  showSearch(){
    this.toggleFilter = false;
    this.showSearchInput = !this.showSearchInput;
  }

  formatCardNumber(cardNo: string): string {
    const visibleDigits = 4;
    const maskedSection = 'X'.repeat(cardNo.length - visibleDigits);
    const lastDigits = cardNo.slice(-visibleDigits);
    return `${maskedSection} ${lastDigits}`;
  }

  /**Using for get the count value */
  getCountingValue(){
    const params:any={};
    params['data'] = {
      id: this.eventPaymentId
    }
    this.countingSubscriber = this.apolloClient.setModule('getEventPaymentCardDetails').queryData(params).subscribe({
      next: (response: GeneralResponse) =>{
        if(response.error) {
          this.alertService.error(response.message);
          return;
        }
        else{
          this.getCountData = response.data;
          //console.log("getCountData......",this.getCountData.rsvpTotal);
          
        }
      },
      error: err=>{
        console.log(err);
      }
    })
  }

  paymentExport(){
    this.loaderService.show();
    this.csvService.getPaymentReq(this.eventId).subscribe(
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
          const defaultFilename = 'payment-list';
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

  changePaymentMode(event:any){
    this.paymentSubmitForm?.get('paymentDetails')?.get('gatewayChargeCost')?.setValue('');
    if(event.target.value === 'Paypal' || event.target.value === 'Zelle'){
      this.changePaymentStatus = true;
    }
    else{
      this.changePaymentStatus = false;
    }
    this.cal();
  }

  getVal(event:any){
    this.rsvpVal  =  event.target.value;
    // JSON.parse(event.target.value.toLowerCase());
    //console.log(JSON.parse(event.target.value.toLowerCase()));
    // this.paymentSubmitForm?.get('paymentDetails')?.get('paymentStatus')?.setValue(JSON.parse(event.target.value.toLowerCase()));
  }

  refund_amount(transactionId:any){
    const params={
      intentId: transactionId,
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      eventId: this.eventId
    }
    this.loaderService.show();
    this.paymentService.refundableAmount(params).subscribe({
        next: (response) => {
          this.alertService.error(response.message);
          this.loaderService.hide();
          this.getPaymentList(this.eventPaymentId, this.current);
        },
        error: (error) => {
          this.loaderService.hide();
          this.alertService.error(error.error.message);
        }
      });
  }

  addRsvp(){
    console.log("eventId=====",this.eventId);
    
    this.router.navigateByUrl('/events/add-rsvp/'+ this.eventId);
  }


  toggle(){
    this.showSearchInput = false;
    if( this.toggleFilter === false){
      this.toggleFilter = true;
    }
    else{
      this.toggleFilter = false;
    }
  }
}
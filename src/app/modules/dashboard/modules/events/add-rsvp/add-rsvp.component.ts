import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-add-rsvp',
  templateUrl: './add-rsvp.component.html',
  styleUrls: ['./add-rsvp.component.css']
})
export class AddRsvpComponent implements OnInit, OnDestroy {
  private eventIdSubscriber!: Subscription;
  private eventDetailsSubscriber!: Subscription;
  eventId: any;
  eventData: any;
  communityId!: string;
  passiveMemberList: any;
  activeMemberList: any;
  isTrack: boolean = false;
  getSelectedUser: any;
  totalCount: number = 0;
  adultCount: number = 0;
  seniorCount: number = 0;
  childrenCount: number = 0;
  rsvpForm!: FormGroup;
  packageForm!: FormGroup; // For managing packages
  eventPackageDetails: any;
  paymentMode = ["Cash", "Check", "Zelle", "Paypal"];
  changePaymentValue: number = 0;
  changeTypeStatus: boolean = false;
  grandTotal: any = 0;
  userSaveSubscriber!: Subscription;
  getCurrency: string = "";
  totalPackage: number = 0;
  hasIncrement: boolean = false;
  donation: number = 0;
  concesion: number = 0;
  paymentCategoryValue!: string;

  constructor(
    private activatedRoute : ActivatedRoute,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private formBuilder : FormBuilder,
    private router: Router,
  ){
    this.getCurrency = this.storageService.getLocalStorageItem('currency');
  }
  ngOnInit(): void {
    this.eventIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params=>{
        this.eventId = params.get('id');
      },
      error: err=>{}
    });
    if(this.eventId){
      this.getEventDetail();
    }
    this.initForm();
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
    this.getEventPackages();
    // this.getActiveMembersList();
  }

  ngOnDestroy(): void {
    if(this.eventIdSubscriber){
      this.eventIdSubscriber.unsubscribe();
    }
    if(this.eventDetailsSubscriber){
      this.eventDetailsSubscriber.unsubscribe();
    }
    if(this.userSaveSubscriber){
      this.userSaveSubscriber.unsubscribe();
    }
  }

  initForm(){
    this.rsvpForm = this.formBuilder.group({
      userType:[''],
      userId: [''],
      name: [''],
      phoneCode:[''],
      phone: [''],
      email: [''],
      numberAdults:[0],
      numberSeniors: [0],
      numberChildren: [0],
      paymentMode: [''],
      checkNo: [''],
      transactionId: [''],
      description: [''],
      totalAmount: [0],
      transactionAmount: [0]
      // donationAmount: [0],
      // concessionAmount: [0]
    })
    // Initialize the package form
    this.packageForm = this.formBuilder.group({
      packages: this.formBuilder.array([]) // FormArray for dynamic package handling
    });
  }

  // Getter for accessing the FormArray
   get packages(): FormArray {
    return this.packageForm.get('packages') as FormArray;
  }

   /**Using for get the event Details*/
   getEventDetail(){
     const params:any= {};
     params['getMyCommunityEventByIdId'] = this.eventId;
     this.loaderService.show();
     this.eventDetailsSubscriber = this.apolloClient.setModule('getMyCommunityEventByID').mutateData(params).subscribe((response: any) => {
       this.loaderService.hide();
       if(response.error) {
         this.alertService.error(response.message);
       } else {
         this.eventData = response.data;
        //  this.getActiveMembersList();
         console.log("eventData.........",this.eventData?.invitationType);
       }
     });
   }

   getPassiveMembersList(){
    const params:any = {};
    params['data'] = {
      communityId: this.communityId,
      isTrack: this.isTrack,
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else{
        this.passiveMemberList = response.data.members;
      }
    })
    this.loaderService.hide();
   }

   getActiveMembersList(){
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      rsvpType: ["No_Reply","Maybe"]
    }
    this.loaderService.show();
    this.apolloClient.setModule('getRsvpMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else{
        this.activeMemberList = response.data?.rsvps;
        // console.log("activeMemberList=======",this.activeMemberList);
      }
    })
    this.loaderService.hide();
   }

   selectUser(event:any){
    if(event.target.value === "activeuser"){
      this.rsvpForm.controls['userId'].setValue('');
      this.rsvpForm.controls['name'].setValue('');
      this.rsvpForm.controls['phoneCode'].setValue('');
      this.rsvpForm.controls['phone'].setValue('');
      this.rsvpForm.controls['email'].setValue('');
      this.isTrack = false;
      this.getSelectedUser = "activeuser";
      this.getActiveMembersList();
    }
    if(event.target.value === "passiveuser"){
      this.rsvpForm.controls['userId'].setValue('');
      this.rsvpForm.controls['name'].setValue('');
      this.rsvpForm.controls['phoneCode'].setValue('');
      this.rsvpForm.controls['phone'].setValue('');
      this.rsvpForm.controls['email'].setValue('');
      this.isTrack = true;
      this.getSelectedUser = "passiveuser";
      this.getPassiveMembersList();
    }
    if(event.target.value === "webvisitor"){
      this.rsvpForm.controls['userId'].setValue('');
      this.getSelectedUser = "webvisitor";
    }
   }

   /**Total members count */
   countValue(){
    this.totalCount = this.rsvpForm.value.numberChildren + this.rsvpForm.value.numberAdults + this.rsvpForm.value.numberSeniors;
    if(this.totalCount === this.totalPackage ){
      // this.alertService.error("Member count is max than package count");
      this.hasIncrement = true;
    }
    else if(this.totalPackage < this.totalCount){
      this.hasIncrement = true;
    }
    else{
      this.hasIncrement = false;
    }
  }

  countPackageValue(){

  }

  /*Function name : adultCountIncrement
  Purpose: Using for increment the adult members count
  */
  adultCountIncrement(){
    if (!this.hasIncrement) {
      this.adultCount = this.rsvpForm.value.numberAdults;
      this.adultCount++;
       this.rsvpForm.patchValue({
        numberAdults: this.adultCount
      })
      if(this.paymentCategoryValue === 'per_head'){
        this.countValue();
      }
    }
  }

  /*Function name : adultCountDecrement
  Purpose: Using for decrement the adult members count
  */
  adultCountDecrement(){
    this.adultCount = this.rsvpForm.value.numberAdults;
    this.adultCount--;
     this.rsvpForm.patchValue({
      numberAdults: this.adultCount
    })
    if(this.paymentCategoryValue === 'per_head'){
      this.countValue();
    }
  }

  /*Function name : seniorCountIncrement
  Purpose: Using for increment the senior members count
  */
  seniorCountIncrement(){
    if (!this.hasIncrement) {
      this.seniorCount = this.rsvpForm.value.numberSeniors;
      this.seniorCount++;
       this.rsvpForm.patchValue({
        numberSeniors: this.seniorCount
      })
      if(this.paymentCategoryValue === 'per_head'){
        this.countValue();
      }
    }
  }

  /*Function name : seniorCountDecrement
  Purpose: Using for decrement the senior members count
  */
  seniorCountDecrement(){
    this.seniorCount = this.rsvpForm.value.numberSeniors;
    this.seniorCount--;
     this.rsvpForm.patchValue({
      numberSeniors: this.seniorCount
    })
    if(this.paymentCategoryValue === 'per_head'){
      this.countValue();
    }
  }

   /*Function name : childrenCountIncrement
  Purpose: Using for increment the children members count
  */
  childrenCountIncrement(){
    if (!this.hasIncrement) {
      this.childrenCount = this.rsvpForm.value.numberChildren;
      this.childrenCount++;
       this.rsvpForm.patchValue({
        numberChildren: this.childrenCount
      })
      if(this.paymentCategoryValue === 'per_head'){
        this.countValue();
      }
    }
  }

  /*Function name : childrenCountDecrement
  Purpose: Using for decrement the children members count
  */
  childrenCountDecrement(){
    this.childrenCount = this.rsvpForm.value.numberChildren;
    this.childrenCount--;
     this.rsvpForm.patchValue({
      numberChildren: this.childrenCount
    })
    if(this.paymentCategoryValue === 'per_head'){
      this.countValue();
    }
  }

  /**Get event package details */
  getEventPackages(){
    const params:any= {};
    params['getchildEventDetailsId'] = this.eventId;
    this.loaderService.show();
    this.apolloClient.setModule('getchildEventDetails').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.eventPackageDetails = response.data?.paymentPackages;
        this.paymentCategoryValue = response.data?.paymentCategory
        this.initializePackageForm();
        console.log("eventPackageDetails======",this.paymentCategoryValue);
      }
    })
    this.loaderService.hide();
  }

  /**Select payment method depend on condition */
  changePaymentMode(event:any){
    if(event.target.value === 'Paypal' || event.target.value === 'Zelle'){
      this.changePaymentValue = 1;
      this.rsvpForm.controls['transactionId'].setValue('');
      this.rsvpForm.controls['checkNo'].setValue('');
    }
    else if(event.target.value === 'Check'){
      this.changePaymentValue = 2;
      this.rsvpForm.controls['transactionId'].setValue('');
    }
    else{
      this.changePaymentValue = 0;
      this.rsvpForm.controls['checkNo'].setValue('');
      this.rsvpForm.controls['transactionId'].setValue('');
    }
  }

  changeConsessionDonation(event:any){
    // console.log("event====", event.target.checked);
    if(event.target.checked === true){
      this.changeTypeStatus = true;
    }
    else{
      this.changeTypeStatus = false;
    }
    
  }

  /** Initialize form controls for packages dynamically */
  initializePackageForm() {
    this.eventPackageDetails.forEach((pkg: any) => {
      const packageFormGroup = this.formBuilder.group({
        packageId: [pkg.id],
        number: [0] // Initial value for number of packages
      });
      this.packages.push(packageFormGroup); // Add the FormGroup to the FormArray
    });
  }

  /** Increment package count */
  incrementPackageCount(index: number) {
    const currentCount = this.packages.at(index).get('number')?.value;
    this.packages.at(index).get('number')?.setValue(currentCount + 1);
    this.calculateGrandTotal();
    this.totalPackageCount();
    this.countValue();
  }

  /** Decrement package count */
  decrementPackageCount(index: number) {
    const currentCount = this.packages.at(index).get('number')?.value;
    if (currentCount > 0) {
      this.packages.at(index).get('number')?.setValue(currentCount - 1);
      this.calculateGrandTotal();
      this.totalPackageCount();
      this.countValue();
    }
  }
  totalPackageCount(){
    let total = 0;
    this.packages.controls.forEach(control => {
    const count = control.get('number')?.value || 0;
    total += count;
    });
    this.totalPackage = total;
  // return total;
  }

   /** Function to get formatted package details */
  getFormattedPackageDetails() {
    return this.packages.value.map((pkg: any) => ({
      packageId: pkg.packageId,
      number: pkg.number
    }));
  }

 /** Calculate the total for each package */
  calculatePackageTotal(index: number): number {
    const packageRate = this.eventPackageDetails[index].packageRate; // Get package rate from eventPackageDetails
    const packageCount = this.packages.at(index).get('number')?.value; // Get count from form control
    
    if (!packageRate || !packageCount) {
      return 0;
    }
    
    const total = packageRate * packageCount;
    return total;
  }


/** Calculate the grand total for all packages */
calculateGrandTotal() {
  this.grandTotal = this.packages.controls.reduce((total, current, index) => {
    this.totalPackage  = total;
    return total + this.calculatePackageTotal(index); // Sum up totals from each package
  }, 0);  
}

isNumber(evt:any) {
  evt = (evt) ? evt : window.event;
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
  }
  return true;
}

numericOnly(event: { which: any; keyCode: any; }): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
    return false;
  }
  return true;
}

/**Using for Save Data */
saveData(){
  if(this.rsvpForm.value.userType === "" || this.rsvpForm.value.userType === null || this.rsvpForm.value.userType === undefined){
    this.alertService.error("Please select user type");
    return;
  }
  if(this.rsvpForm.value.userType === 'activeuser' || this.rsvpForm.value.userType === 'passiveuser'){
    if(this.rsvpForm.value.userId === "" || this.rsvpForm.value.userId === null || this.rsvpForm.value.userId === undefined){
      this.alertService.error("Please Select user");
      return;
    }
  }
  if(this.rsvpForm.value.userType === 'webvisitor'){
    if(this.rsvpForm.value.name === "" || this.rsvpForm.value.name === null || this.rsvpForm.value.name === undefined){
      this.alertService.error("Please enter the web visitor name");
      return;
    }
    if(this.rsvpForm.value.phoneCode === "" || this.rsvpForm.value.phoneCode === null || this.rsvpForm.value.phoneCode === undefined){
      this.alertService.error("Please Select the country code");
      return;
    }
    if(this.rsvpForm.value.phone === "" || this.rsvpForm.value.phone === null || this.rsvpForm.value.phone === undefined){
      this.alertService.error("Please enter the phone number");
      return;
    }
    if(this.rsvpForm.value.email !== '' || null){
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!this.rsvpForm.value.email.match(regex)){
        this.alertService.error("Incorrect Email!");
        return;
      }
    }
  }
  if(this.eventData.paymentStatus!== 'Free'){
    if(this.grandTotal === 0 || this.grandTotal === "" || this.grandTotal === null){
      this.alertService.error("Please enter the package details");
      return;
    }
    if(this.rsvpForm.value.paymentMode === "" || this.rsvpForm.value.paymentMode === null || this.rsvpForm.value.paymentMode === undefined){
      this.alertService.error("Please select the payment mode");
      return;
    }
    
    if(this.rsvpForm.value.paymentMode === 'Check'){
      if(this.rsvpForm.value.checkNo === "" || this.rsvpForm.value.checkNo === null || this.rsvpForm.value.checkNo === undefined){
        this.alertService.error("Pleasr enter the check number");
        return;
      }
    }
    if(this.rsvpForm.value.paymentMode === 'Zelle' || this.rsvpForm.value.paymentMode === 'Paypal'){
      if(this.rsvpForm.value.transactionId === "" || this.rsvpForm.value.transactionId === null || this.rsvpForm.value.transactionId === undefined){
        this.alertService.error("Pleasr enter the transaction id");
        return;
      }
    }
    if(this.rsvpForm.value.transactionAmount === "" || this.rsvpForm.value.transactionAmount === null || this.rsvpForm.value.transactionAmount === undefined || this.rsvpForm.value.transactionAmount === 0){
      this.alertService.error("Please enter the amount");
      return;
    }
  }
  if(this.totalCount === 0){
    this.alertService.error("Please enter the member count");
    return;
  }
  if(this.totalCount > this.totalPackage ){
    this.alertService.error("Member count is max than package count");
    this.hasIncrement = true;
    return;
  }
  
  // if(this.changeTypeStatus === false){
  //   if(this.rsvpForm.value.donationAmount === "" || this.rsvpForm.value.donationAmount === null || this.rsvpForm.value.donationAmount === undefined || this.rsvpForm.value.donationAmount === 0){
  //     this.alertService.error("Please enter donation amount");
  //     return;
  //   }
  // }
  // if(this.changeTypeStatus === true){
  //   if(this.rsvpForm.value.concessionAmount === "" || this.rsvpForm.value.concessionAmount === null || this.rsvpForm.value.concessionAmount === undefined || this.rsvpForm.value.concessionAmount === 0){
  //     this.alertService.error("Please enter concession amount");
  //     return;
  //   }
  // }
  const params:any={};
  const paymentParams:any={}
  const packageDetails = this.getFormattedPackageDetails();
   if(this.getSelectedUser === "activeuser" || this.getSelectedUser === "passiveuser"){
    params['data'] = {
            eventId: this.eventId,
            userId: this.rsvpForm.value?.userId,
            userType: this.rsvpForm.value?.userType,
            status: "Attending",
            numberChildren: this.rsvpForm.value?.numberChildren,
            numberAdults: this.rsvpForm.value?.numberAdults,
            numberSeniors: this.rsvpForm.value?.numberSeniors,
            packageDetails: packageDetails
      }
    }
    if(this.getSelectedUser === "webvisitor"){
      params['data'] = {
        eventId: this.eventId,
        status: "Attending",
        userType: this.rsvpForm.value?.userType,
        name: this.rsvpForm.value?.name,
        email: this.rsvpForm.value?.email,
        phone: this.rsvpForm.value?.phone,
        phoneCode: this.rsvpForm.value?.phoneCode,
        numberSeniors: this.rsvpForm.value?.numberSeniors,
        numberAdults: this.rsvpForm.value?.numberAdults,
        numberChildren: this.rsvpForm.value?.numberChildren,
        packageDetails: packageDetails
      }
    } 
    // console.log("params=====",params);
    // console.log("paymentParams=====", paymentParams);
    
    // return;
    this.loaderService.show();
    this.userSaveSubscriber = this.apolloClient.setModule('updateUserRsvp').mutateData(params).subscribe({
      next: (response: GeneralResponse) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }

        paymentParams['data'] = {
          paymentDetails:{
            actualPaymentmtount: this.grandTotal ? this.grandTotal : 0,
            checkNo: this.rsvpForm.value?.checkNo,
            description: this.rsvpForm.value?.description,
            gatewayChargeCost: 0,
            paymentMode: this.rsvpForm.value?.paymentMode,
            transactionId: this.rsvpForm.value?.transactionId,
            transactionAmount: this.rsvpForm.value?.transactionAmount,
            donationAmount: this.donation,
            concessionAmount: this.concesion,
          },
          paymentId: response?.data?.id,
          rsvpStatus: "paid",
        }   
        // Continue with payment update if no error
        if(this.eventData.paymentStatus!== 'Free'){
          this.apolloClient.setModule('updateEventPayment').mutateData(paymentParams).subscribe({
            next: (paymentResponse: GeneralResponse) => {
              if (paymentResponse.error) {
                this.alertService.error(paymentResponse.message);
              } else {
                this.alertService.success("Payment updated successfully!"); // Assuming you want success feedback
                this.router.navigateByUrl(`/events/payment-history-list/${this.eventId}`);
              }
            },
            error: (err) => {
              console.log(err);
              this.alertService.error("Failed to update payment.");
            },
            complete: () => {
              this.loaderService.hide(); // Hide loader after everything is done
            }
          });
        }
        else{
          this.alertService.success(response.message); // Assuming you want success feedback
          this.router.navigateByUrl(`/events/payment-history-list/${this.eventId}`);
        }
      },
      error: (err) => {
        console.log(err);
        this.alertService.error("Failed to save RSVP.");
        this.loaderService.hide();
      }
    });
    
  //  const requestData = {
  //   ...this.rsvpForm.value,
  //   status: "Attending",
  //   packageDetails: packageDetails // Add package details array here
  // };
 }

 /**Calculate concetion and donation amount */
  cal(){
    if(this.grandTotal === this.rsvpForm.value.transactionAmount){
      this.donation = 0;
      this.concesion = 0;
    }  
    else if(this.rsvpForm.value.transactionAmount > this.grandTotal){
      this.donation = this.rsvpForm.value.transactionAmount - this.grandTotal;
      this.concesion = 0;
    }  
    else if(this.rsvpForm.value.transactionAmount < this.grandTotal){
      this.donation = 0;
      this.concesion = this.grandTotal - this.rsvpForm.value.transactionAmount;
    }
  } 
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import {viewSupplier} from 'src/app/shared/models/view-supplier.model';
import { StorageService } from 'src/app/shared/services/storage.service';
declare var window:any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {
  private eventIdSubscriber!: Subscription;
  private adultDetailSubscriber!: Subscription;
  private teengearDetailSubscriber!: Subscription;
  private childrenDetailsSubscriber!: Subscription;
  private childrenDeleteSubscriber!: Subscription;
  private teengearsDeleteSubscriber!: Subscription;
  private adultDeleteSubscriber!: Subscription;
  private deatilsSaveSubscriber!: Subscription;
  private supplierIdSubscriber!: Subscription;
  private eventDetailsSubscriber!: Subscription;
  eventId: any;
  supplierForm!: FormGroup;
  count: number = 0;
  totalQuaintyCount: number = 0;
  tomorrow!: string;
  adultCount: number = 0;
  totalCount: number = 0;
  teenagersCount: number = 0;
  childrenCount: number = 0;
  supplierIdVal: any;
  typeVal!:string;
  assignData: any = [];
  $modal: any;
  childrenData:any;
  teengersData:any;
  adultData: any;
  getSupplierById: viewSupplier = {};
  eventData: any;

  constructor(
    private activatedRoute : ActivatedRoute,
    private apolloClient: ApolloClientService,
    private loaderService: LoaderService,
    private alertService: AlertService,
    private formBuilder : FormBuilder,
    private router: Router,
    private validator: ValidatorService,
    private sharedService: SharedService,
    private storageService: StorageService,
  ){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.tomorrow = tomorrow.toISOString().split('T')[0];
  }
  ngOnInit(): void {
    this.eventIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.eventId = params.get('id');
      },
      error: err => {}
    });
    this.supplierIdSubscriber =  this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.supplierIdVal = params.get('supplierId');
      },
      error: err => {}
    })
    if(this.supplierIdVal){
      this.getTaskDetails();
    }
    this.initForm();
    this.adultModalData();
    this.tenagersModalData();
    this.childrenModalData();
    this.getEventDetail();
  }

  ngOnDestroy(): void {
    if(this.eventIdSubscriber){
      this.eventIdSubscriber.unsubscribe();
    }
    if(this.adultDetailSubscriber){
      this.adultDetailSubscriber.unsubscribe();
    }
    if(this.teengearDetailSubscriber){
      this.teengearDetailSubscriber.unsubscribe();
    }
    if(this.childrenDetailsSubscriber){
      this.childrenDetailsSubscriber.unsubscribe();
    }
    if(this.childrenDeleteSubscriber){
      this.childrenDeleteSubscriber.unsubscribe();
    }
    if(this.teengearsDeleteSubscriber){
      this.teengearsDeleteSubscriber.unsubscribe();
    }
    if(this.adultDeleteSubscriber){
      this.adultDeleteSubscriber.unsubscribe();
    }
    if(this.deatilsSaveSubscriber){
      this.deatilsSaveSubscriber.unsubscribe();
    }
    if(this.supplierIdSubscriber){
      this.supplierIdSubscriber.unsubscribe();
    }
    if(this.eventDetailsSubscriber){
      this.eventDetailsSubscriber.unsubscribe();
    }
  }

   /**Using for  intialize task form */
   initForm(){
    this.supplierForm = this.formBuilder.group({
      supplyItem: ['',[Validators.required, this.validator.isEmpty, this.validator.nameIsLong]],
      supplyItemDescription: ['',[Validators.required, this.validator.isEmpty]],
      neededFor: ['',[Validators.required, this.validator.isEmpty]],
      requiredDate: ['',[Validators.required, this.validator.isEmpty]],
      quaintyNumber: [0],
      adultNumber: [0],
      teenagerNumber: [0],
      childrenNumber: [0],
      fromtime: ['',[Validators.required, this.validator.isEmpty]],
      totime: ['',[Validators.required, this.validator.isEmpty]],
    })
   }

   /**Using for save and upadate the details*/
   saveSupplier(){
    const saveData = this.supplierForm.value;
    if(saveData.quaintyNumber < 0){
      this.alertService.error("Negative number is not allowed");
      return;
    }
    if(saveData.adultNumber < 0){
      this.alertService.error("Negative number is not allowed");
      return;
    }
    if(saveData.teenagerNumber < 0){
      this.alertService.error("Negative number is not allowed");
      return;
    }
    if(saveData.childrenNumber < 0){
      this.alertService.error("Negative number is not allowed");
      return;
    }
    const requireDate = new Date(saveData.requiredDate);
    const params:any={};
    params['data']={
      supplyItem: saveData.supplyItem ? saveData.supplyItem : '',
      //quantity: this.totalQuaintyCount ? this.totalQuaintyCount : 0,
      quantity: saveData.quaintyNumber ? saveData.quaintyNumber : 0,
      supplyItemDescription: saveData.supplyItemDescription ? saveData.supplyItemDescription : '',
      neededFor: saveData.neededFor ? saveData.neededFor : '',
      // requiredDate: saveData.requiredDate ? saveData.requiredDate.toISOString()  : '',
      requiredDate: saveData.requiredDate ? this.sharedService.getStrDate(requireDate)  : '',
      volunteered: this.totalCount ? this.totalCount : 0,
      teamSize:{
        adult: saveData.adultNumber ? saveData.adultNumber : 0,
        teenager: saveData.teenagerNumber ? saveData.teenagerNumber : 0,
        children: saveData.childrenNumber ? saveData.childrenNumber : 0,
      },  
      assignedMembers: this.assignData ? this.assignData : null,
      time: {
        from: saveData.fromtime,
        to: saveData.totime
      }, 
    }
    if(this.supplierIdVal){
      params['data'].id = this.supplierIdVal;
      params['data'].eventId = this.eventId;
      this.loaderService.show();
      this.deatilsSaveSubscriber = this.apolloClient.setModule('updateEventSupplierManagement').mutateData(params).subscribe({
        next:(response: GeneralResponse)=>{
          this.loaderService.hide();
          if(response.error){
            this.alertService.error(response.message);
          }
          else{
            this.alertService.error(response.message);
            this.router.navigateByUrl('/events/supply-management/list/'+this.eventId);
          }
        },
        error: err =>{
          console.log(err);     
          this.loaderService.hide();   
        }
      });
    }
    else{
      params['data'].communityId = this.storageService.getLocalStorageItem('communtityId');
      params['data'].eventId = this.eventId;
      this.loaderService.show();
      this.deatilsSaveSubscriber = this.apolloClient.setModule('createEventSupplierManagement').mutateData(params).subscribe({
        next:(response: GeneralResponse)=>{
          this.loaderService.hide();
          if(response.error){           
            this.alertService.error(response.message);
          }
          else{
            this.alertService.error(response.message);
            this.router.navigateByUrl('/events/supply-management/list/'+this.eventId);
          }
        },
        error: err =>{
          console.log(err);   
          this.loaderService.hide();     
        }
      });
    }
   }

   /** Using for increment the quanity count*/
   countIncrement(){
    this.totalQuaintyCount = this.supplierForm.value.quaintyNumber || 1;
    this.totalQuaintyCount++;
     this.supplierForm.patchValue({
      quaintyNumber: this.totalQuaintyCount
    })
    //this.totalQuaintyCount++;
    //this.count++;
    //this.totalQuaintyCount = this.count;
   }

   /** Using for decrement the quanity count*/
   countDecrement(){
    this.totalQuaintyCount = this.supplierForm.value.quaintyNumber || 1;
    this.totalQuaintyCount--;
     this.supplierForm.patchValue({
      quaintyNumber: this.totalQuaintyCount
    })
    //this.totalQuaintyCount--;
    // this.count--;
    // this.totalQuaintyCount = this.count;
   }

  /* Using for increment the adult members count*/
  adultCountIncrement(){
    //this.adultCount ++;
    this.adultCount = this.supplierForm.value.adultNumber;
    this.adultCount++;
     this.supplierForm.patchValue({
      adultNumber: this.adultCount
    })
    this.countValue();
  }

  /* Using for decrement the adult members count*/
  adultCountDecrement(){
    // this.adultCount --;
    this.adultCount = this.supplierForm.value.adultNumber;
    this.adultCount--;
     this.supplierForm.patchValue({
      adultNumber: this.adultCount
    })
    this.countValue();
  }

  /** Using for decrement the teenagers members count*/
  teenagersCountDecrement(){
    //this.teenagersCount --;
    this.teenagersCount = this.supplierForm.value.teenagerNumber;
    this.teenagersCount--;
     this.supplierForm.patchValue({
      teenagerNumber: this.teenagersCount
    })
    this.countValue();
  }

  /**Using for increment the teenagers members count*/
  teenagersCountIncrement(){
    //this.teenagersCount ++;
    this.teenagersCount = this.supplierForm.value.teenagerNumber;
    this.teenagersCount++;
     this.supplierForm.patchValue({
      teenagerNumber: this.teenagersCount
    })
    this.countValue();
  }

  /**Using for  increment the children members count*/
  childrenCountIncrement(){
    //this.childrenCount ++;
    this.childrenCount = this.supplierForm.value.childrenNumber;
    this.childrenCount++;
     this.supplierForm.patchValue({
      childrenNumber: this.childrenCount
    })
    this.countValue();
  }

  /**Using for  decrement the children members count*/
  childrenCountDecrement(){
    //this.childrenCount --;
    this.childrenCount = this.supplierForm.value.childrenNumber;
    this.childrenCount--;
     this.supplierForm.patchValue({
      childrenNumber: this.childrenCount
    })
    this.countValue();
  }

  /**Using for added total members count */
   countValue(){
    this.totalCount = this.supplierForm.value.adultNumber + this.supplierForm.value.teenagerNumber + this.supplierForm.value.childrenNumber;
  }

   /**Using for get adult user details depends on user type */  
   adultModalData(){ 
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      supplierId: this.supplierIdVal ? this.supplierIdVal : null,
      type: "adult"
    }
    this.loaderService.show();
    this.adultDetailSubscriber = this.apolloClient.setModule('getUserVisibility').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.adultData = response?.data;
          this.adultData.forEach((element:any,index:number) => {
            if(element.isAssigned === true){
              element.showAssignAdult = true;
              element.isAdultSave = true;
              this.assignData.push({
                UserId: element.id,
                type: element.type
              });
            }
            else{
              element.showAssignAdult = false;
              element.isAdultSave = false;
            }
          });
        }
      },
      error: err=>{
        console.log(err);
      }
    });  
    this.loaderService.hide();   
  }

  /**Using for the adult members list show in modal*/
  adultAssign(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("chooseAdultList")
    );
    this.$modal.show();
  }

  /**Using for get teenagers user details depends on user type */  
  tenagersModalData(){ 
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      supplierId: this.supplierIdVal ? this.supplierIdVal : null,
      type: "teenager"
    }
    this.loaderService.show();
    this.teengearDetailSubscriber = this.apolloClient.setModule('getUserVisibility').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.teengersData = response?.data;
          this.teengersData.forEach((element:any,index:number) => {
            if(element.isAssigned === true){
              element.showAssignteengears = true;
              element.isTeengearsSave = true;
              this.assignData.push({
                UserId: element.id,
                type: element.type
              });
            }
            else{
              element.showAssignteengears = false;
              element.isTeengearsSave = false;
            }
          });
        }
      },
      error: err=>{
        console.log(err);
      }
    });  
    this.loaderService.hide();   
  }

  /**Using for the teenager members list show in modal*/
  teenagersAssign(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("chooseTeengersList")
    );
    this.$modal.show();
  }

   /**Using for get the children members list*/
   childrenModalData(){
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      supplierId: this.supplierIdVal ? this.supplierIdVal : null,
      type: "children",
    }
    this.loaderService.show();
    this.childrenDetailsSubscriber = this.apolloClient.setModule('getUserVisibility').queryData(params).subscribe({
      next:(response: GeneralResponse)=> {
        if(response.error) {
          this.alertService.error(response.message);
          return;
        } 
        else {
          this.childrenData = response.data;      
          this.childrenData.forEach((element:any,index:number) => {
            if(element.isAssigned === true){
              element.showAssignChild = true;
              element.isSave = true;
              this.assignData.push({
                UserId: element.id,
                type: element.type
              });
            }
            else{
              element.showAssignChild = false;
              element.isSave = false;
            }
            
          });
        }
      },
      error : err => {
        console.log(err);
      }
    });
    this.loaderService.hide();
  }

  /**Using for the children members list show in modal*/
  childrenAssign(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("chooseChildrenList")
    );
    this.$modal.show();
  }

  /**Using for assign the child members*/
  assignChild(value:any,index:number){
    this.childrenData[index].showAssignChild = true;
  }

  /**Using for save the selected assign child member*/
  saveAssignChild(index:number){
    this.assignData.push({
      UserId: this.childrenData[index].id,
      type: this.childrenData[index].type
    });
    this.childrenData[index].isSave = true;
    this.childrenData[index].showAssignChild = true;
  }

  /**Using for delete the assigned child member*/
  deleteAssignChild(index:number,UserId:string){
    const params: any = {};
        params['data']={
          UserId: UserId,
          supplierId: this.supplierIdVal ? this.supplierIdVal : null
    }
    if(this.supplierIdVal && this.childrenData[index].isAssigned){
      this.childrenDeleteSubscriber = this.apolloClient.setModule('deleteAssignSupplierMembers').mutateData(params).subscribe({
        next: (response: GeneralResponse) =>{
          if(response.error){
            this.alertService.error(response.message);
            return;
          }
          else{
            this.alertService.success(response.message);
            this.childrenData[index].showAssignChild = false;
            let findPos = this.assignData.findIndex((val:any) => (val.UserId === UserId));
            this.assignData.splice(findPos,1);
            this.childrenData[index].isSave = false;
          }
        },
        error: err=>{
          console.log(err);
        }
      });
    }
    else{
      this.childrenData[index].showAssignChild = false;
      let findPos = this.assignData.findIndex((val:any) => (val.UserId === UserId));
      this.assignData.splice(findPos,1);
      this.childrenData[index].isSave = false;
    }
  }

  /**Using for assign the teengears members*/
  assignteengears(value:any,index:number){
    this.teengersData[index].showAssignteengears = true;
  }

  /**Using for save the selected assign teengear member*/
  saveAssignTeengears(index:number){
    this.assignData.push({
      UserId: this.teengersData[index].id,
      type: this.teengersData[index].type
    })
    this.teengersData[index].isTeengearsSave = true;
    this.teengersData[index].showAssignteengears = true;
  }

  /**Using for delete the assigned child member*/
  deleteAssignTeengears(index:number,UserId:string){
    const params: any = {};
        params['data']={
          UserId: UserId,
          supplierId: this.supplierIdVal ? this.supplierIdVal : null
    }
    if(this.supplierIdVal && this.teengersData[index].isAssigned){
      this.teengearsDeleteSubscriber = this.apolloClient.setModule('deleteAssignSupplierMembers').mutateData(params).subscribe({
        next: (response: GeneralResponse) =>{
          if(response.error){
            this.alertService.error(response.message);
            return;
          }
          else{
            this.alertService.success(response.message);
            this.teengersData[index].showAssignteengears = false;
            let findPos = this.assignData.findIndex((val:any) => (val.UserId === UserId));
            this.assignData.splice(findPos,1);
            this.teengersData[index].isTeengearsSave = false;
          }
        },
        error: err=>{
          console.log(err);
        }
      });
    }
    else{
      this.teengersData[index].showAssignteengears = false;
      let findPos = this.assignData.findIndex((val:any) => (val.UserId === UserId));
      this.assignData.splice(findPos,1);
      this.teengersData[index].isTeengearsSave = false;
    }
  }

  /**Using for assign the adult members*/
  assignadult(value:any,index:number){
    this.adultData[index].showAssignAdult = true;
  }

  /**Using for save the selected assign teengear member*/
  saveAssignAdult(index:number){
    this.assignData.push({
      UserId: this.adultData[index].id,
      type: this.adultData[index].type
    })
    this.adultData[index].isAdultSave = true;
    this.adultData[index].showAssignAdult = true;
  }

  /**Using for delete the assigned child member*/
  deleteAssignAdult(index:number,UserId:string){
    const params: any = {};
        params['data']={
          UserId: UserId,
          supplierId: this.supplierIdVal ? this.supplierIdVal : null
    }
    if(this.supplierIdVal && this.adultData[index].isAssigned){
      this.adultDeleteSubscriber = this.apolloClient.setModule('deleteAssignSupplierMembers').mutateData(params).subscribe({
        next: (response: GeneralResponse) =>{
          if(response.error){
            this.alertService.error(response.message);
            return;
          }
          else{
            this.alertService.success(response.message);
            this.adultData[index].showAssignAdult = false;
            let findPos = this.assignData.findIndex((val:any) => (val.UserId === UserId));
            this.assignData.splice(findPos,1);
            this.adultData[index].isAdultSave = false;
          }
        },
        error: err=>{
          console.log(err);
        }
      });
    }
    else{
      this.adultData[index].showAssignAdult = false;
      let findPos = this.assignData.findIndex((val:any) => (val.UserId === UserId));
      this.assignData.splice(findPos,1);
      this.adultData[index].isAdultSave = false;
    }
  }

  /**Using get supplier details by id */
  getTaskDetails(){
    const params:any = {};
    params['data'] = {
      supplierId: this.supplierIdVal
    }
    this.loaderService.show();
    this.apolloClient.setModule('getEventSupplierById').queryData(params).subscribe({
      next: (response:GeneralResponse) =>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.getSupplierById = response.data.orders;
          this.supplierForm.patchValue({
            supplyItem: this.getSupplierById.supplyItem ? this.getSupplierById.supplyItem : '',
            supplyItemDescription: this.getSupplierById.supplyItemDescription ? this.getSupplierById.supplyItemDescription : '',
            neededFor: this.getSupplierById.neededFor ? this.getSupplierById.neededFor : '',
            // requiredDate: this.getSupplierById.requiredDate ? this.sharedService.getDateFormat(this.getSupplierById.requiredDate) : '',
            requiredDate: this.getSupplierById.requiredDate ? new Date(this.getSupplierById.requiredDate) : '',
            quaintyNumber: this.getSupplierById && typeof this.getSupplierById.quantity === "number" ? this.getSupplierById.quantity : 0,
            adultNumber: this.getSupplierById.teamSize && typeof this.getSupplierById.teamSize.adult === "number" ? this.getSupplierById.teamSize.adult : 0,
            teenagerNumber: this.getSupplierById.teamSize && typeof this.getSupplierById.teamSize.teenager === "number" ? this.getSupplierById.teamSize.teenager : 0,
            childrenNumber: this.getSupplierById.teamSize && typeof this.getSupplierById.teamSize.children === "number" ? this.getSupplierById.teamSize.children : 0,
            fromtime: this.getSupplierById.time?.to ?  this.sharedService.getTimeFormat(this.getSupplierById.time?.from) : '',
            totime: this.getSupplierById.time?.from ? this.sharedService.getTimeFormat(this.getSupplierById.time?.to) : '',
          });
          this.totalCount = this.getSupplierById && typeof this.getSupplierById.volunteered === "number" ? this.getSupplierById.volunteered : 0;
          //this.totalQuaintyCount = this.getSupplierById && typeof this.getSupplierById.quantity === "number" ? this.getSupplierById.quantity : 0;
          // this.adultCount = this.getSupplierById.teamSize && typeof this.getSupplierById.teamSize.adult === "number" ? this.getSupplierById.teamSize.adult : 0;
          //this.teenagersCount = this.getSupplierById.teamSize && typeof this.getSupplierById.teamSize.teenager === "number" ? this.getSupplierById.teamSize.teenager : 0;
          //this.childrenCount = this.getSupplierById.teamSize && typeof this.getSupplierById.teamSize.children === "number" ? this.getSupplierById.teamSize.children : 0;
         
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loaderService.hide();
  }

   /**Using for get the event name*/
   getEventDetail()
   {
     const params:any= {};
     params['getMyCommunityEventByIdId'] = this.eventId;
 
     this.loaderService.show();
 
     this.eventDetailsSubscriber = this.apolloClient.setModule('getMyCommunityEventByID').mutateData(params).subscribe((response: any) => {
       this.loaderService.hide();
       if(response.error) {
         this.alertService.error(response.message);
       } else {
 
         this.eventData = response.data;
       }
     });
   }

   //Enforce Positive Numbers
   onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
  
    // If value is less than 1, set it to 1 or empty
    if (value < 1) {
      input.value = '';
      this.supplierForm.get('quaintyNumber')?.setValue(null); // optional
    }
  }
  
}

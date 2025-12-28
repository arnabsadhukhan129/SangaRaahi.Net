import { Component, OnChanges, OnInit, SimpleChanges,OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnyARecord } from 'dns';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import {viewTask} from 'src/app/shared/models/view-task.module';
import { bool } from 'aws-sdk/clients/signer';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { StorageService } from 'src/app/shared/services/storage.service';
declare var window:any;

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit,OnChanges,OnDestroy {
  //todayDate = new Date(Date.now() + ( 3600 * 1000 * 24));
  todayDate = new Date();
  adultCount: number = 0;
  teenagersCount: number = 0;
  childrenCount: number = 0;
  totalCount: number = 0;
  eventId: any;
  taskId: any;
  eventData: any;
  adultData: any;
  teengersData: any;
  childrenData: any;
  $modal: any;
  taskForm!: FormGroup;
  showChild: any = false;
  assignData: any = [];
  endDateVal!: Date;
  isSave: boolean = false;
  isTeengearsSave: boolean = false;
  isAdultSave: boolean = false;
  taskDetails: viewTask = {};
  private eventIdSubscriber!: Subscription;
  private eventDetailsSubscriber!: Subscription;
  private adultDetailsSubscriber!: Subscription;
  private teengearDetailsSubscriber!: Subscription;
  private childrenDetailsSubscriber!: Subscription;
  private deatilsSaveSubscriber!: Subscription;
  private taskIdSubscriber!: Subscription;
  private adultDetailSubscriber!: Subscription;
  private teengearDetailSubscriber!: Subscription;
  private adultDeleteSubscriber!: Subscription;
  private teengearsDeleteSubscriber!: Subscription;
  private childrenDeleteSubscriber!: Subscription

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
  ){}

  ngOnInit(): void {
    this.eventIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.eventId = params.get('id');
      },
      error: err => {}
    });
    this.taskIdSubscriber =  this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.taskId = params.get('taskId');
      },
      error: err => {}
    })
    if(this.eventId){
      this.getEventDetail();
    }
    if(this.taskId){
      this.getTaskDetails();
    }
    this.initForm();
    this.childrenModalData();
    this.teenagersModalData();
    this.adultModalData();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    if(this.eventIdSubscriber){
      this.eventIdSubscriber.unsubscribe();
    }
    if(this.eventDetailsSubscriber){
      this.eventDetailsSubscriber.unsubscribe();
    }
    if(this.adultDetailsSubscriber){
      this.adultDetailsSubscriber.unsubscribe();
    }
    if(this.teengearDetailsSubscriber){
      this.teengearDetailsSubscriber.unsubscribe();
    }
    if(this.childrenDetailsSubscriber){
      this.childrenDetailsSubscriber.unsubscribe();
    }
    if(this.deatilsSaveSubscriber){
      this.deatilsSaveSubscriber.unsubscribe();
    }
    if(this.taskIdSubscriber){
      this.taskIdSubscriber.unsubscribe();
    }
    if(this.adultDetailSubscriber){
      this.adultDetailSubscriber.unsubscribe();
    }
    if(this.teengearDetailSubscriber){
      this.teengearDetailSubscriber.unsubscribe();
    }
    if(this.adultDeleteSubscriber){
      this.adultDeleteSubscriber.unsubscribe();
    }
    if(this.teengearsDeleteSubscriber){
      this.teengearsDeleteSubscriber.unsubscribe();
    }
    if(this.childrenDeleteSubscriber){
      this.childrenDeleteSubscriber.unsubscribe();
    }
  }

  /**Using for  intialize task form */
  initForm(){
    this.taskForm = this.formBuilder.group({
      taskName: ['',[Validators.required, this.validator.isEmpty, this.validator.nameIsLong]],
      priority: ['',[Validators.required, this.validator.isEmpty]],
      taskDescription: ['',[Validators.required, this.validator.isEmpty]],
      taskStartDate: ['',[Validators.required, this.validator.isEmpty]],
      taskDeadline: ['',[Validators.required, this.validator.isEmpty]],
      fromtime: ['',[Validators.required, this.validator.isEmpty]],
      totime: ['',[Validators.required, this.validator.isEmpty]],
      adultNumber:[0],
      teenagerNumber: [0],
      childrenNumber: [0]
    })
  }

  /*
  Function name : adultCountIncrement
  Purpose: Using for increment the adult members count
  */
  adultCountIncrement(){
    //this.adultCount ++;
    this.adultCount = this.taskForm.value.adultNumber;
    this.adultCount++;
     this.taskForm.patchValue({
      adultNumber: this.adultCount
    })
    this.countValue();
  }

  /*
  Function name : adultCountDecrement
  Purpose: Using for decrement the adult members count
  */
  adultCountDecrement(){
    //this.adultCount --;
    this.adultCount = this.taskForm.value.adultNumber;
    this.adultCount--;
     this.taskForm.patchValue({
      adultNumber: this.adultCount
    })
    this.countValue();
  }

  /*
  Function name : teenagersCountDecrement
  Purpose: Using for decrement the teenagers members count
  */
  teenagersCountDecrement(){
    //this.teenagersCount --;
    this.teenagersCount = this.taskForm.value.teenagerNumber;
    this.teenagersCount--;
     this.taskForm.patchValue({
      teenagerNumber: this.teenagersCount
    })
    this.countValue();
  }

  /**Using for increment the teenagers members count*/
  teenagersCountIncrement(){
    //this.teenagersCount ++;
    this.teenagersCount = this.taskForm.value.teenagerNumber;
    this.teenagersCount++;
     this.taskForm.patchValue({
      teenagerNumber: this.teenagersCount
    })
    this.countValue();
  }

  /**Using for  increment the children members count*/
  childrenCountIncrement(){
    // this.childrenCount ++;
    this.childrenCount = this.taskForm.value.childrenNumber;
    this.childrenCount++;
     this.taskForm.patchValue({
      childrenNumber: this.childrenCount
    })
    this.countValue();
  }

  /**Using for  decrement the children members count*/
  childrenCountDecrement(){
    //this.childrenCount --;
    this.childrenCount = this.taskForm.value.childrenNumber;
    this.childrenCount--;
     this.taskForm.patchValue({
      childrenNumber: this.childrenCount
    })
    this.countValue();
  }

  /**Using for added total members count */
  countValue(){
    this.totalCount = this.taskForm.value.adultNumber + this.taskForm.value.teenagerNumber + this.taskForm.value.childrenNumber;
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

  /**Using for get the adult members list*/
  adultModalData(){
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      taskId: this.taskId ? this.taskId : null,
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
          this.adultData = response.data;
          //console.log(this.adultData);
          
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

  /**Using for get the teenager members list*/
  teenagersModalData(){
    const params:any = {};
    params['data'] = {
      eventId: this.eventId,
      taskId: this.taskId ? this.taskId : null,
      type: "teenager"
    }
    this.loaderService.show();
    this.teengearDetailSubscriber = this.teengearDetailsSubscriber = this.apolloClient.setModule('getUserVisibility').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        } 
        else{
          this.teengersData = response.data;
          this.teengersData.forEach((element:any,index:number)=>{
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
      type: "children",
      taskId: this.taskId ? this.taskId : null
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

  /**Using for save and upadate the details*/
  saveData(){
      const saveData = this.taskForm.value;
      if (saveData.adultNumber < 0 || saveData.teenagerNumber < 0 || saveData.childrenNumber < 0) {
        this.alertService.error("Negative number is not allowed");
        return;
      }
      const startDate = new Date(saveData.taskStartDate);
      const endDate = new Date(saveData.taskDeadline);
      const params: any = {
        data: {
          taskName: saveData.taskName ? saveData.taskName : '',
          priority: saveData.priority ? saveData.priority : '',
          taskDescription: saveData.taskDescription ? saveData.taskDescription : '',
          // taskStartDate: saveData.taskStartDate ? saveData.taskStartDate.toISOString() : '',
          // taskDeadline: saveData.taskDeadline ? saveData.taskDeadline.toISOString()  : '',
          taskStartDate: saveData.taskStartDate ? this.sharedService.getStrDate(startDate) : '',
          taskDeadline: saveData.taskDeadline ? this.sharedService.getStrDate(endDate)  : '',
          requireTeam: this.totalCount ? this.totalCount : 0,
          teamSize: {
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
      };
    
      if (this.taskId) {
        params.data.taskId = this.taskId;
        params.data.eventId = this.eventId;
        this.loaderService.show();
        this.apolloClient.setModule('updateEventTask').mutateData(params).subscribe({
          next: (response: GeneralResponse) => {
            this.loaderService.hide(); // Move hide() inside the subscription
            if (response.error) {
              this.alertService.error(response.message);
            } else {
              this.alertService.success(response.message); // Change to success() instead of error()
              this.router.navigateByUrl('/events/task-management-list/' + this.eventId);
            }
          },
          error: err => {
            console.log(err);
            this.loaderService.hide(); // Move hide() inside the subscription
          }
        });
      } else {
        params.data.communityId = this.storageService.getLocalStorageItem('communtityId');
        params.data.eventId = this.eventId;
        this.loaderService.show();
        this.deatilsSaveSubscriber = this.apolloClient.setModule('createEventTask').mutateData(params).subscribe({
          next: (response: GeneralResponse) => {
            this.loaderService.hide(); // Move hide() inside the subscription
            if (response.error) {
              this.alertService.error(response.message);
            } else {
              this.alertService.success(response.message); // Change to success() instead of error()
              this.router.navigateByUrl('/events/task-management-list/' + this.eventId);
            }
          },
          error: err => {
            console.log(err);
            this.loaderService.hide(); // Move hide() inside the subscription
          }
        });
      }
  }

  /**Using for assign the adult members*/
  assignadult(value:any,index:number){
    this.adultData[index].showAssignAdult = true;
  }

  /**Using for assign the teengears members*/
  assignteengears(value:any,index:number){
    this.teengersData[index].showAssignteengears = true;
  }

  /**Using for assign the child members*/
  assignChild(value:any,index:number){
    this.childrenData[index].showAssignChild = true;
  }
      
  /**Using for delete the assigned adult member*/
  deleteAssignAdult(index:number,UserId:string){
    //console.log(this.adultData[index]);
    
    const params: any = {};
        params['data']={
          UserId: UserId,
          taskId: this.taskId ? this.taskId : null
    }
    if(this.taskId && this.adultData[index].isAssigned){
      this.adultDeleteSubscriber = this.apolloClient.setModule('deleteAssignMember').mutateData(params).subscribe({
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

  /**Using for save the selected assign adult member*/
  saveAssignAdult(index:number){
    this.assignData.push({
      UserId: this.adultData[index].id,
      type: this.adultData[index].type
    })
    this.adultData[index].isAdultSave = true;
    this.adultData[index].showAssignAdult = true;
  }

  /**Using for delete the assigned teengear member*/
  deleteAssignTeengears(index:number,UserId:string){
    const params: any = {};
        params['data']={
          UserId: UserId,
          taskId: this.taskId ? this.taskId : null
    }
    if(this.taskId && this.teengersData[index].isAssigned){
      this.teengearsDeleteSubscriber = this.apolloClient.setModule('deleteAssignMember').mutateData(params).subscribe({
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
  deleteAssignChild(index:number,UserId:string){
    const params: any = {};
        params['data']={
          UserId: UserId,
          taskId: this.taskId ? this.taskId : null
    }
    if(this.taskId && this.childrenData[index].isAssigned){
      this.childrenDeleteSubscriber = this.apolloClient.setModule('deleteAssignMember').mutateData(params).subscribe({
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

  /**Using for save the selected assign child member*/
  saveAssignChild(index:number){
    this.assignData.push({
      UserId: this.childrenData[index].id,
      type: this.childrenData[index].type
    })
    this.childrenData[index].isSave = true;
    this.childrenData[index].showAssignChild = true;
  }

  /**Using for get the end date*/
  getEndDate(event:any){
    this.endDateVal = event.target.value;
    this.taskForm.patchValue({
      taskDeadline: '',  
    });
  }

  /**Using get task details by id */
  getTaskDetails(){
    const params:any = {};
    params['data'] = {
      taskId: this.taskId
    }
    this.loaderService.show();
    this.apolloClient.setModule('getEventTaskById').queryData(params).subscribe({
      next: (response:GeneralResponse) =>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.taskDetails = response.data.tasks;
          this.taskForm.patchValue({
            taskName: this.taskDetails.taskName ? this.taskDetails.taskName : '',
            priority: this.taskDetails.priority ? this.taskDetails.priority : '',
            taskDescription: this.taskDetails.taskDescription ? this.taskDetails.taskDescription : '',
            // taskStartDate: this.taskDetails.taskStartDate ? this.sharedService.getDateFormat(this.taskDetails.taskStartDate) : '',
            // taskDeadline: this.taskDetails.taskDeadline ? this.sharedService.getDateFormat(this.taskDetails.taskDeadline) : '',
            taskStartDate: this.taskDetails.taskStartDate ? new Date(this.taskDetails.taskStartDate) : '',
            taskDeadline: this.taskDetails.taskDeadline ? new Date(this.taskDetails.taskDeadline) : '',
            adultNumber: this.taskDetails.teamSize && typeof this.taskDetails.teamSize.adult === "number" ? this.taskDetails.teamSize.adult : 0,
            teenagerNumber: this.taskDetails.teamSize && typeof this.taskDetails.teamSize.teenager === "number" ? this.taskDetails.teamSize.teenager : 0,
            childrenNumber: this.taskDetails.teamSize && typeof this.taskDetails.teamSize.children === "number" ? this.taskDetails.teamSize.children : 0,
            fromtime: this.taskDetails.time?.from ?  this.sharedService.getTimeFormat(this.taskDetails.time.from) : '',
            totime: this.taskDetails.time?.to ?  this.sharedService.getTimeFormat(this.taskDetails.time.to) : '',
          });
          this.totalCount = this.taskDetails && typeof this.taskDetails.requireTeam === "number" ? this.taskDetails.requireTeam : 0;

          //this.adultCount = this.taskDetails.teamSize && typeof this.taskDetails.teamSize.adult === "number" ? this.taskDetails.teamSize.adult : 0;

          //this.teenagersCount = this.taskDetails.teamSize && typeof this.taskDetails.teamSize.teenager === "number" ? this.taskDetails.teamSize.teenager : 0;

          //this.childrenCount = this.taskDetails.teamSize && typeof this.taskDetails.teamSize.children === "number" ? this.taskDetails.teamSize.children : 0;
         
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loaderService.hide();
  }


}

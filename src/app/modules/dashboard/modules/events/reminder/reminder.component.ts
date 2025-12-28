import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { param } from 'jquery';
import * as FileSaver from 'file-saver';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.css']
})
export class ReminderComponent implements OnInit,OnDestroy {
  isSettings: boolean = false;
  isrsvpYes: boolean = false;
  isrsvpNo: boolean = false;
  isrsvpNotAttending: boolean = false;
  isrsvpTentative:boolean =false;
  isrsvpAll: boolean = false;
  rsvpYesValue: string = "";
  rsvpNoValue: string = "";
  rsvpAllValue: string = "";
  reminderForm!: FormGroup;
  remindSubscriber!: Subscription;
  eventRemindSubscriber!: Subscription;
  removeReminderToggle!: Subscription;
  eventId!: any;
  rsvp_admin_controll: any = [];
  getRemiderData: any;
  remain:boolean = false;
  yesToggleId: string = "";
  noToggleId: string = "";
  allToggleId: string = "";
  isCawnType: boolean = false;
  cawnForm!: FormGroup;
  getEventDate:any;
  fequencyStatus!: any;
  eventReminderSubscriber!: Subscription;
  today!: string;
  minTime: string = '00:00';
  utcDateTime:any;

  constructor(
    private formBuilder : FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private validator: ValidatorService,
  ){
    this.activatedRoute.paramMap.subscribe(params => {
      this.eventId = params.get('id');
    });
    this.activatedRoute.paramMap.subscribe(params => {
      this.fequencyStatus = params.get('status');
    });
  }
  ngOnInit(): void {
    this.declareForm();
    this.dateTime();
    // if(this.eventId){
    //   this.getReminderStatus();
    // }
  }

  dateTime() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
  }
  
  // Utility function
  updateMinTime(date: Date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    this.minTime = `${hours}:${minutes}`;
  }
  

  ngOnDestroy(): void {
    if(this.remindSubscriber){
      this.remindSubscriber.unsubscribe();
    }
    if(this.eventRemindSubscriber){
      this.eventRemindSubscriber.unsubscribe();
    }
    if(this.eventReminderSubscriber){
      this.eventReminderSubscriber.unsubscribe();
    }
  }

  /**IntalizeForm....... */
  declareForm(){
    this.initForm();
  }


  /**Using for reminder form initalization */
  initForm(){
    this.reminderForm = this.formBuilder.group({
      reminder: [false],
      yesRsvp: [''],
      rsvpYesSms: [''],
      rsvpYesEmail: [''],
      noRsvp: [''],
      rsvpNoSms: [''],
      rsvpNoEmail: [''],
      notAttendingRSVP:[''],
      rsvpNoAttendingSms:[''],
      rsvpNoAttendingEmail:[''],
      tentativeRSVP: [''],
      rsvpTentativeSms:[''],
      rsvpTentativeEmail:[''],
      allRsvp: [''],
      rsvpAllSms: [''],
      rsvpAllEmail: [''],
      notificationType: [''],
      notificationDate: [''],
      notificationTime: ['']
    })
  }

  /**Using for Set Reminder Settings & Frequency toggle */
  reminderSetting(event:any){
    if(event.target.checked){
      this.isSettings = true;
    }
    else{
      this.isSettings = false;
      //Yes Rsvp
      this.reminderForm.controls['yesRsvp'].setValue(false);
      this.reminderForm.controls['rsvpYesSms'].setValue('');
      this.reminderForm.controls['rsvpYesEmail'].setValue('');
      this.isrsvpYes = false;

      //No Rsvp
      this.reminderForm.controls['noRsvp'].setValue(false);
      this.reminderForm.controls['rsvpNoSms'].setValue('');
      this.reminderForm.controls['rsvpNoEmail'].setValue('');
      this.isrsvpNo = false;

      //Not Attending Rsvp
      this.reminderForm.controls['notAttendingRSVP'].setValue(false);
      this.reminderForm.controls['rsvpNoAttendingSms'].setValue('');
      this.reminderForm.controls['rsvpNoAttendingEmail'].setValue('');
      this.isrsvpNotAttending = false;

      //Not Attending Rsvp
      this.reminderForm.controls['tentativeRSVP'].setValue(false);
      this.reminderForm.controls['rsvpTentativeSms'].setValue('');
      this.reminderForm.controls['rsvpTentativeEmail'].setValue('');
      this.isrsvpNotAttending = false;

      //All Rsvp
      this.reminderForm.controls['allRsvp'].setValue(false);
      this.reminderForm.controls['rsvpAllSms'].setValue('');
      this.reminderForm.controls['rsvpAllEmail'].setValue('');
      this.isrsvpAll = false;
    }
    this.remindSubscriber = this.apolloClient.setModule('setRemainderStatusChange').mutateData({setRemainderStatusChangeId: this.eventId}).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
        else{
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
      },
      error: err =>{
        console.log(err);        
      }
    })
  }

  /**Using for rsvp yes toggle */
  rsvpYes(event:any){
    if(event.target.checked){
      this.isrsvpYes = true;
      this.rsvpYesValue = "Yesrsvp";
    }
    else{
      this.isrsvpYes = false;
      this.rsvpYesValue = "";
      this.reminderForm.controls['rsvpYesSms'].setValue('');
      this.reminderForm.controls['rsvpYesEmail'].setValue('');
      if(this.yesToggleId !== "" || this.yesToggleId !== null || this.yesToggleId !== undefined){
        this.remove(this.yesToggleId);
      }
    }
  }

  /**Using for rsvp no toggle */
  rsvpNo(event:any){
    if(event.target.checked){
      this.isrsvpNo = true;
      this.rsvpNoValue = "Norsvp";
    }
    else{
      this.isrsvpNo = false;
      this.rsvpNoValue = "";
      this.reminderForm.controls['rsvpNoSms'].setValue('');
      this.reminderForm.controls['rsvpNoEmail'].setValue('');
      if(this.yesToggleId !== "" || this.yesToggleId !== null || this.yesToggleId !== undefined){
        this.remove(this.noToggleId);
      }
    }
  }

  /**Using for rsvp all toggle */
  rsvpAll(event:any){
    if(event.target.checked){
      this.isrsvpAll = true;
      this.rsvpAllValue = "All";
    }
    else{
      this.isrsvpAll = false;
      this.rsvpAllValue = "";
      this.reminderForm.controls['rsvpAllSms'].setValue('');
      this.reminderForm.controls['rsvpAllEmail'].setValue('');
      if(this.yesToggleId !== "" || this.yesToggleId !== null || this.yesToggleId !== undefined){
        this.remove(this.allToggleId);
      }
    }
  }

  /**Using for save cawn data */
  saveCornData(){
    const params:any ={};
    params['data']={
      eventId: this.eventId,
      notificationType : this.reminderForm?.value?.notificationType ?  this.reminderForm?.value?.notificationType : null,
      notificationDate:  this.reminderForm?.value?.notificationDate ? this.reminderForm?.value?.notificationDate : null,
      // notificationTime:  this.utcDateTime.toISOString().split('T')[1].slice(0,5), // "HH:mm"
      notificationTime: this.utcDateTime ? this.utcDateTime.toISOString().split('T')[1].slice(0, 5) : null,

      notificationStatus: null
    }
    // console.log("params=====",params);
    
    if (this.reminderForm?.value?.notificationType === 'scheduled') {
      if(this.fequencyStatus === 'yes'){
        params['data']['rsvpType'] = "Yesrsvp";
      }
      else if(this.fequencyStatus === 'no'){
        params['data']['rsvpType'] = "Norsvp";
      }
      else if(this.fequencyStatus === 'not-attending'){
        params['data']['rsvpType'] = "Not_Attending";
      }
      else if(this.fequencyStatus === 'tentative'){
        params['data']['rsvpType'] = "tentative";
      }
      else if(this.fequencyStatus === 'all'){
        params['data']['rsvpType'] = "All";
      }
      // params['data']['notificationDate'] = this.reminderForm?.value?.notificationDate;
      // params['data']['notificationTime'] = this.reminderForm?.value?.notificationTime;
    }
    // console.log("params======",params);
    // return;
    this.eventReminderSubscriber = this.apolloClient.setModule('eventImmediateRemember').mutateData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
        else{
          this.loaderService.hide();
          this.alertService.error(response.message);
          // this.router.navigateByUrl('/events/deep-link/'+this.eventId);
          this.router.navigateByUrl('/events/cron-list/'+this.eventId);
        }
      },
      error: err =>{
        console.log(err);        
      }
    })
    // if(this.isCawnType){
    //   if(!this.cawnForm?.value?.notificationDate){
    //     this.alertService.error('Please enter date!');
    //     return;
    //   }
    //   if(!this.cawnForm?.value?.notificationTime){
    //     this.alertService.error('Please enter time!');
    //     return;
    //   }
    // }

    // console.log("cawnForm------>",this.cawnForm.value);
    
  }

  /**Using for save data */
  save(){
    // const base_url = 'https://sangarahinet.demoyourprojects.com/'
    const base_url = 'https://api.sangaraahi.net/'
    if(this.fequencyStatus === 'yes'){
      if(this.reminderForm.value.rsvpYesSms === null || this.reminderForm.value.rsvpYesSms === "" || this.reminderForm.value.rsvpYesSms === undefined){
        this.alertService.error('SMS is required');
        return;
      } 
      if(this.reminderForm.value.rsvpYesEmail === null || this.reminderForm.value.rsvpYesEmail === "" || this.reminderForm.value.rsvpYesEmail === undefined){
        this.alertService.error('Email is required');
        return;
      }
    }

    if(this.fequencyStatus === 'no'){
      if(this.reminderForm.value.rsvpNoSms === null || this.reminderForm.value.rsvpNoSms === "" || this.reminderForm.value.rsvpNoSms === undefined){
        this.alertService.error('SMS is required');
        return;
      } 
      if(this.reminderForm.value.rsvpNoEmail === null || this.reminderForm.value.rsvpNoEmail === "" || this.reminderForm.value.rsvpNoEmail === undefined){
        this.alertService.error('Email is required');
        return;
      }
    }

    if(this.fequencyStatus === 'not-attending'){
      if(this.reminderForm.value.rsvpNoAttendingSms === null || this.reminderForm.value.rsvpNoAttendingSms === "" || this.reminderForm.value.rsvpNoAttendingSms === undefined){
        this.alertService.error('SMS is required');
        return;
      } 
      if(this.reminderForm.value.rsvpNoAttendingEmail === null || this.reminderForm.value.rsvpNoAttendingEmail === "" || this.reminderForm.value.rsvpNoAttendingEmail === undefined){
        this.alertService.error('Email is required');
        return;
      }
    }

    if(this.fequencyStatus === 'tentative'){
      if(this.reminderForm.value.rsvpTentativeSms === null || this.reminderForm.value.rsvpTentativeSms === "" || this.reminderForm.value.rsvpTentativeSms === undefined){
        this.alertService.error('SMS is required');
        return;
      } 
      if(this.reminderForm.value.rsvpTentativeEmail === null || this.reminderForm.value.rsvpTentativeEmail === "" || this.reminderForm.value.rsvpTentativeEmail === undefined){
        this.alertService.error('Email is required');
        return;
      }
    }

    if(this.fequencyStatus === 'all'){
      if(this.reminderForm.value.rsvpAllSms === null || this.reminderForm.value.rsvpAllSms === "" || this.reminderForm.value.rsvpAllSms === undefined){
        this.alertService.error('SMS is required');
        return;
      } 
      if(this.reminderForm.value.rsvpAllEmail === null || this.reminderForm.value.rsvpAllEmail === "" || this.reminderForm.value.rsvpAllEmail === undefined){
        this.alertService.error('Email is required');
        return;
      }
    }
    if(!this.reminderForm.value.notificationType){
      this.alertService.error('Please Select Cron Type');
      return;
    }

    if(this.reminderForm.value.notificationType === 'scheduled'){
      if(!this.reminderForm.value.notificationDate){
        this.alertService.error('Please Select Cron Date');
      return;
      }
      if(!this.reminderForm.value.notificationTime){
        this.alertService.error('Please Select Cron Time');
      return;
      }
      const selectedDateStr = this.reminderForm.get('notificationDate')?.value; // e.g. "2025-05-01"
      const selectedTimeStr = this.reminderForm.get('notificationTime')?.value; // e.g. "14:30"

      const localDateTime = new Date(`${selectedDateStr}T${selectedTimeStr}`);
      const utcDateTime = new Date(localDateTime.toISOString()); // force conversion to UT
      this.utcDateTime = utcDateTime; // save if needed later
      const now = new Date();
      if (localDateTime < now) {
        this.alertService.error('Cron time is in the past');
        return;
      }

    }

    if(this.fequencyStatus === 'yes'){
      this.rsvp_admin_controll.push({
        rsvpType: 'Yesrsvp',
        emailContent: this.reminderForm.value.rsvpYesEmail ? this.reminderForm.value.rsvpYesEmail : '',
        smsContent: this.reminderForm.value.rsvpYesSms ? this.reminderForm.value.rsvpYesSms : '',
        // deepLink: base_url+'events/deep-link/'+this.eventId
        deepLink: base_url+'api/deep-link/'+this.eventId
      });
    }
    
    if(this.fequencyStatus === 'no'){
      this.rsvp_admin_controll.push({
        rsvpType: 'Norsvp',
        emailContent: this.reminderForm.value.rsvpNoEmail ? this.reminderForm.value.rsvpNoEmail : '',
        smsContent: this.reminderForm.value.rsvpNoSms ? this.reminderForm.value.rsvpNoSms : '',
        // deepLink: base_url+'events/deep-link/'+this.eventId
        deepLink: base_url+'api/deep-link/'+this.eventId
      });
    }
    if(this.fequencyStatus === 'not-attending'){
      this.rsvp_admin_controll.push({
        rsvpType: 'Not_Attending',
        emailContent: this.reminderForm.value.rsvpNoAttendingEmail ? this.reminderForm.value.rsvpNoAttendingEmail : '',
        smsContent: this.reminderForm.value.rsvpNoAttendingSms ? this.reminderForm.value.rsvpNoAttendingSms : '',
        // deepLink: base_url+'events/deep-link/'+this.eventId
        deepLink: base_url+'api/deep-link/'+this.eventId
      });
    }
    if(this.fequencyStatus === 'tentative'){
      this.rsvp_admin_controll.push({
        rsvpType: 'tentative',
        emailContent: this.reminderForm.value.rsvpTentativeEmail ? this.reminderForm.value.rsvpTentativeEmail : '',
        smsContent: this.reminderForm.value.rsvpTentativeSms ? this.reminderForm.value.rsvpTentativeSms : '',
        // deepLink: base_url+'events/deep-link/'+this.eventId
        deepLink: base_url+'api/deep-link/'+this.eventId
      });
    }
    if(this.fequencyStatus === 'all'){
      this.rsvp_admin_controll.push({
        rsvpType: 'All',
        emailContent: this.reminderForm.value.rsvpAllEmail ? this.reminderForm.value.rsvpAllEmail : '',
        smsContent: this.reminderForm.value.rsvpAllSms ? this.reminderForm.value.rsvpAllSms : '',
        // deepLink: base_url+'events/deep-link/'+this.eventId
        deepLink: base_url+'api/deep-link/'+this.eventId
      });
    }
    this.loaderService.show();
    const params:any ={};
    params['data']={
      id: this.eventId,
      rsvpAdminControll : this.rsvp_admin_controll
    }
    // console.log(params['data']);
    // return;
    
    this.eventRemindSubscriber = this.apolloClient.setModule('updateRsvpAdminControll').mutateData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
        else{
          this.saveCornData();
          // this.loaderService.hide();
          // this.alertService.error(response.message);
          // // this.router.navigateByUrl('/events/deep-link/'+this.eventId);
          // this.router.navigateByUrl('/events');
        }
      },
      error: err =>{
        console.log(err);        
      }
    })
  }

  cancel(){
    this.router.navigateByUrl('/events');
  }

  getReminderStatus(){
    const params:any= {};
    params['data'] = {
      id: this.eventId
    };
    this.loaderService.show();
    this.apolloClient.setModule('getAllRsvpAdminControll').queryData(params).subscribe({
      next: (response:GeneralResponse) =>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.remain = response.data?.remain;
          this.getRemiderData = response.data?.rsvpAdminControll;
          this.patchFrequencyData();
        }
      }
    })
  }

  patchFrequencyData() {
    if(this.remain === true){
      this.reminderForm.controls['reminder'].setValue(true);
      this.isSettings  = true;
    }
    else{
      this.reminderForm.controls['reminder'].setValue(false);
      this.isSettings = false;
    }
    for (const element of this.getRemiderData) {
        const id = element.id;
        if (element.rsvpType === "All") {
          this.allToggleId = element?.id;
          this.isrsvpAll = true;
          this.rsvpAllValue = "All";
          this.reminderForm.controls['allRsvp'].setValue(true);
            this.reminderForm.patchValue({
                rsvpAllSms: element.smsContent,
                rsvpAllEmail: element.emailContent,
            });
        }
        if (element.rsvpType === "Norsvp") {
            this.noToggleId = element?.id;
            this.isrsvpNo = true;
            this.rsvpNoValue = "Norsvp";
            this.reminderForm.controls['noRsvp'].setValue(true);
            this.reminderForm.patchValue({
                rsvpNoSms: element.smsContent,
                rsvpNoEmail: element.emailContent,
            });
        }

        if (element.rsvpType === "Yesrsvp") {
            this.yesToggleId = element?.id;
            this.isrsvpYes = true;
            this.rsvpYesValue = "Yesrsvp";
            this.reminderForm.controls['yesRsvp'].setValue(true);
            this.reminderForm.patchValue({
                rsvpYesSms: element.smsContent,
                rsvpYesEmail: element.emailContent,
            });
        }
    }
  }

  /**Using for remove the frequency data */
  remove(removeId:string){
    const params:any = {};
    params['data']= {
      id: removeId,
      eventId: this.eventId
    }
     this.removeReminderToggle = this.apolloClient.setModule('removeRemainderSettingsEvent').mutateData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
        else{
          this.loaderService.hide();
        }
      },
      error: err =>{
        console.log(err);        
      }
    })
  }

  //Select Cawn Type.............
  selectCawnType(event:any){
    // console.log("evnet.........",event.target.value);
    if(event.target.value === 'scheduled'){
      this.isCawnType = true;
      this.getEventDetails();
    }
    else{
      this.isCawnType = false;
    }
  }

  //Get Event Details.................
  getEventDetails()
  {
    const params:any= {};
    params['getMyCommunityEventByIdId'] = this.eventId;
    this.apolloClient.setModule('getMyCommunityEventByID').mutateData(params).subscribe((response: any) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getEventDate = response.data?.date?.from;
        // console.log("getEventDate========",this.getEventDate);
        
      }
    })
  }
}

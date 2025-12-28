import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ValidatorFn, AbstractControl, FormGroup, FormArray, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';
import { Item } from 'src/app/shared/components/multi-drop-down/multi-dropdown.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subscription } from 'rxjs';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {map, startWith} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { StorageService } from 'src/app/shared/services/storage.service';
import { AnyARecord } from 'dns';
import { DatePipe } from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CommonService } from '../../../services/common.service';
import { ChangeDetectorRef } from '@angular/core';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
// import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
})

export class CreateEventComponent implements OnDestroy {
  @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;
  @ViewChild('memberInput') memberInput!: ElementRef<HTMLInputElement>;
  removeGroupSubscriber!: Subscription;
  announcer = inject(LiveAnnouncer);
  eventForm!: FormGroup;
  eventImage: string = '';
  logoImage: string = '';
  packageLogo: any = [''];
  eventId!: any;
  venueDetails : any = {
    firstAddressLine: '',
    secondAddressLine: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    phoneNo: '',
    phoneCode: ''
  };
  isDisabled : boolean = true;
  countryData! : Array<CountryCodes>; //any = [];
  stateData : any = [];
  filteredOptions!: Array<CountryCodes>;
  filteredOptions1!: Array<CountryCodes>;
  //countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  todayDate = new Date(Date.now() + ( 3600 * 1000 * 24));
  todate! : Date;
  rsvpEndTime! : Date;
  getFromDate!: any;
  openCropImageModal: boolean= false;
  imageChangedEvent: any;
  getFileName: any;
  croppedImage: any ;
  croppedPackageImage: any = [];
  openPackageCropImageModal: any = [false];
  openLogoCropImageModal: boolean= false;
  imageLogoChangedEvent: any;
  imagePackageChangedEvent: any = [];
  //getLogoFileName: any;
  croppedLogoImage: any;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  separatorKeysCodes1: number[] = [ENTER, COMMA];
  groupCtrl = new FormControl([]);
  memberCtrl= new FormControl([]);
  //filteredFruits: Observable<string[]>;
  getGroupData: any = [];
  getMemberData: any = [];
  groups: any = [];
  members: any = [];
  attandanceCount:number = 0;
  guestCount: number = 0;
  visitorsCount:number = 0;
  paymentStatusValue: any = "";
  paymentCategoryValue: any = "";
  groupDisabled: boolean = false;
  groupDataArray:any = [];
  memberDataArray:any = [];
  getCurrency: string = "";
  isPrivateInvitation: boolean = false;
  payPackage: any;
  index!:number;
  getMemberIndex!: number;
  getGroupIndex!: number;
  isShowWebVisitor: boolean = false;
  isShowMaxNumber: boolean = false;
  beforeDay:  any;
  currentDay: any
  createdtAt: any;
  showWebVisitors: boolean = false;
  isGroupRemove: boolean = false;
  isRecurringEvent: boolean = false;
  ismonthly: boolean = false;
  isOccuranceWise:boolean = false;
  totalQuaintyCount: number = 0;
  weeks:any = [];
  dd: any = [];
  minDate = new Date(); 
  getPaymentStatus:boolean = false;
  dates: number[] = [];
  getEventId!: string;
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  imageUrl: any;
  packageImagePreviews: string[] = []; // optional, for preview
  packageImageUrls: string[] = [];     // final uploaded URLs


  constructor(
    private alertService: AlertService,
    private sharedService: SharedService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private formBuilder: FormBuilder,
    private validator: ValidatorService,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private fileUploadService: FileUploadService
    // private ListComponent: ListComponent
)
{
  this.getCurrency = this.storageService.getLocalStorageItem('currency');
  this.currentDay = new Date().toISOString().split('T')[0];
 //console.log("currentDay2222.....",new Date());
  this.activatedRoute.paramMap.subscribe(params => {
    this.eventId = params.get('id');
  }); 
  
  // Populate the dates array with values from 1 to 31
  for (let i = 1; i <= 31; i++) {
    this.dates.push(i);
  }
  this.loaderService.show();
}

  ngOnInit() : void
  {
    this.generateForm();
    this.getMemberList(this.current);
    this.getCommunityGroup();
    this.getCountryCodes();
    this.getEventPaymentSettingStatus();
  }

  ngOnDestroy(): void {
    if(this.removeGroupSubscriber){
      this.removeGroupSubscriber.unsubscribe()
    }
  }
  generateForm()
  {
        // let payPackage:any = []
        // if(this.paymentCategoryValue === 'per_head'){
        //   payPackage = this.formBuilder.array([
        //     this.createPaymentPackage(),
        //   ])commonService
        // }
        // else{
        //   payPackage = this.formBuilder.array([
        //     this.createPaymentPackage(),
        //     this.createPaymentPackage(),
        //     this.createPaymentPackage()
        //   ])
        // }
        // console.log("payPackage....",payPackage);
        
        this.eventForm = new FormGroup({
          title : new FormControl('', [Validators.required, this.validator.nameIsLong]),
          description : new FormControl('', [Validators.required]),
          image : new FormControl(''),
          logoImage : new FormControl(''),
          type : new FormControl('', [Validators.required]),
          firstAddressLine: new FormControl('', [Validators.required]),
          secondAddressLine: new FormControl(''),
          city: new FormControl('', [Validators.required]),
          state: new FormControl('', [Validators.required]),
          country: new FormControl('', [Validators.required]),
          zipcode: new FormControl('', [Validators.required]),
          //countryCode:new FormControl('', [Validators.required]),
          //phone: new FormControl('',[Validators.required,this.validator.isEmpty,this.validator.isMobileNumber]),
          phoneCode: new FormControl('', [Validators.required]),
          phoneNo: new FormControl('',[Validators.required,this.validator.isEmpty,this.validator.isMobileNumber]),
         
          fromdate: new FormControl(''),
          todate: new FormControl(''),        
          
          fromtime: new FormControl('',[Validators.required]),
          totime: new FormControl('',[Validators.required]),
        
          invitationType: new FormControl('', [Validators.required]),
          rsvpEndTime: new FormControl(''),
          restrictNumberAttendees: new FormControl(false),
          postEventAsCommunity: new FormControl(false), 
          attendeeListVisibilty: new FormControl(false),
          collectEventPhotos: new FormControl(false), 
          //numberOfMaxAttendees: new FormControl(null),
          groupCtrl:  new FormControl([]),
          memberCtrl: new FormControl([]),
          paymentStatus: new FormControl('Free'),
          paymentCategory: new FormControl(''),
          webvistorRestriction: new FormControl(false),
          paymentPackages: this.formBuilder.array([
            this.createPaymentPackages(),
            this.createPaymentPackages(),
            this.createPaymentPackages()
          ]),
          paymentPackage: this.formBuilder.array([
            this.createPaymentPackage()
          ]),
          webCount: new FormControl(0),
          attendanceCounts: new FormControl(0),
          numberOfMaxGuests: new FormControl(0),
          recurringEvent: new FormControl(false),
          recurringType: new FormControl('weekly'),
          occurances: new FormControl(0),
          dateIndex: new FormControl(0),
          wise: new FormControl('date')
      });

  }

  get paymentPackages() : FormArray {
    return this.eventForm.get('paymentPackages') as FormArray;
  }

  get paymentPackage() : FormArray {
    return this.eventForm.get('paymentPackage') as FormArray;
  }

  getEventDetails()
  {
    const params:any= {};
    params['getMyCommunityEventByIdId'] = this.eventId;
    let groupData : any = {};
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityEventByID').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        groupData = response.data;
        console.log("country======",groupData.venueDetails.country);
        
        if(groupData?.recurringDetails){
          this.isRecurringEvent = true;
        }
        if(groupData.venueDetails.country!='')
        {
          this.getState(groupData.venueDetails.country);
        }
        if(groupData.paymentStatus === 'Paid')
        {
          this.paymentSatusChanged('Paid');
        }
        
        if(groupData.invitationType === 'Private')
        {
          this.getInvitationTypeValues('Private');
        }
        if(groupData.paymentCategory === 'package_wise')
        {
          this.paymentCategoryChanged('package_wise');
          this.eventForm.setControl('paymentPackages',this.setPackagesForm(groupData.paymentPackages));
        }
        if(groupData.paymentCategory === 'per_head')
        {
          this.paymentCategoryChanged('per_head');
          this.eventForm.setControl('paymentPackage',this.setPackageForm(groupData.paymentPackages));
        }
        if(groupData.attendees.isRestricted){
          this.isShowMaxNumber = true;
        }
        if(groupData.attendees.webvistorRestriction){
          this.isShowWebVisitor = true;
        }
        this.getEventId = groupData.id ? groupData.id : this.eventId;
        this.getFromDate =  groupData.date.from ? this.sharedService.getDateFormat(groupData.date.from)  : this.todayDate;        
        this.rsvpEndTime = new Date(this.getFromDate);
        this.rsvpEndTime.setDate(this.rsvpEndTime.getDate() - 1);
        this.eventForm.patchValue({
          paymentStatus: groupData.paymentStatus ? groupData.paymentStatus : '',
          paymentCategory: groupData.paymentCategory ? groupData.paymentCategory : '',
          title : groupData.title ? groupData.title : '',
          description : groupData.description ? groupData.description : '',
          type : groupData.type ? groupData.type : '',
          firstAddressLine: groupData.venueDetails.firstAddressLine ? groupData.venueDetails.firstAddressLine : '',
          secondAddressLine: groupData.venueDetails.secondAddressLine ? groupData.venueDetails.secondAddressLine : '',
          city: groupData.venueDetails.city ? groupData.venueDetails.city : '',
          state: groupData.venueDetails.state ? groupData.venueDetails.state : '',
          country: groupData.venueDetails.country ? groupData.venueDetails.country : '',
          zipcode: groupData.venueDetails.zipcode ? groupData.venueDetails.zipcode : '',
          phoneCode : groupData.venueDetails.phoneCode ? groupData.venueDetails.phoneCode : '',
          phoneNo: groupData.venueDetails.phoneNo ? groupData.venueDetails.phoneNo : '',
          // fromdate: groupData.date.from ? this.sharedService.getDateFormat(groupData.date.from) : '',
          // todate: groupData.date.to ? this.sharedService.getDateFormat(groupData.date.to) : '',    
          fromdate: groupData.date.from ? new Date(groupData.date.from) : '',
          todate: groupData.date.to ? new Date(groupData.date.to) : '',    
          fromtime: groupData.time.from ? this.sharedService.getTimeFormat(groupData.time.from) : '',
          totime: groupData.time.to ? this.sharedService.getTimeFormat(groupData.time.to) : '',
          invitationType: groupData.invitationType ? groupData.invitationType : '',
          rsvpEndTime: groupData.rsvpEndTime ? new Date(groupData.rsvpEndTime) : '',
          restrictNumberAttendees: groupData.attendees.isRestricted ? groupData.attendees.isRestricted : false,
          postEventAsCommunity: groupData.postEventAsCommunity ? groupData.postEventAsCommunity : false,
          attendeeListVisibilty:  groupData.attendees?.attendeesListVisibility === 'Host' ?  true : false,//true
          collectEventPhotos: groupData.attendees.mediaUploadByAttendees ? groupData.attendees.mediaUploadByAttendees : false,
          //numberOfMaxAttendees: groupData.attendees.numberOfMaxAttendees ? groupData.attendees.numberOfMaxAttendees : null,
          webvistorRestriction: groupData.attendees.webvistorRestriction ? groupData.attendees.webvistorRestriction : false,
          webCount: groupData.attendees?.numberOfMaxWebVisitors ? groupData.attendees?.numberOfMaxWebVisitors : null,
          attendanceCounts: groupData.attendees?.numberOfMaxAttendees ? groupData.attendees?.numberOfMaxAttendees : null,
          numberOfMaxGuests: groupData.attendees?.numberOfMaxGuests ? groupData.attendees?.numberOfMaxGuests : null,
          recurringEvent: groupData.recurringEvent ? groupData.recurringEvent : false,
          recurringType: groupData.recurringDetails ? (groupData.recurringDetails.recurreingType ? groupData.recurringDetails.recurreingType : "weekly") : null,
          occurances: groupData.recurringDetails ? (groupData.recurringDetails.occurationNumber ? groupData.recurringDetails.occurationNumber: 0) : null
        });
        if(groupData?.recurringDetails && groupData?.recurringDetails?.recurreingType){
          if(groupData?.recurringDetails?.recurreingType === "monthly"){
            this.ismonthly = true;
          }
          else{
            this.ismonthly = false;
          }
        }
        // console.log("recurreingType....==>",groupData.recurringDetails.recurreingType)
        if(groupData?.recurringDetails && groupData?.recurringDetails?.occurationNumber > 0){
          this.eventForm.controls['wise'].setValue('occurance');
          this.isOccuranceWise = true;
          this.isRecurringEvent = true;
          this.cdRef.detectChanges();
        }
        if(groupData?.recurringDetails && groupData?.recurringDetails?.monthlyDate){
          const parsedDate = parseInt(groupData.recurringDetails.monthlyDate[0]);
          this.dd.push(parsedDate);
        }

        if(groupData?.recurringDetails && groupData?.recurringDetails?.weeklyDayIndex){
          for (const key in groupData?.recurringDetails?.weeklyDayIndex) {
            if (groupData?.recurringDetails?.weeklyDayIndex.hasOwnProperty(key)) {
              const value = groupData?.recurringDetails?.weeklyDayIndex[key]; 
              // console.log("value====>",value);
              //  console.log("value type===>", typeof(value));
               
              // If the value is "1", push the key (day index) as a number into this.weeks
              if (value === 1) {
                this.weeks.push(value);
              }
              if (value === 2) {
                this.weeks.push(value);
              }
              if (value === 3) {
                this.weeks.push(value);
              }
              if (value === 4) {
                this.weeks.push(value);
              }
              if (value === 5) {
                this.weeks.push(value);
              }
              if (value === 6) {
                this.weeks.push(value);
              }
              if (value === 0) {
                this.weeks.push(value);
              }
            }
          }
        }
        // this.getMemberData = groupData.members ? memberArrayVal : [];
        // let memberArrayVal = 
        let memberArrayVal = groupData.members.map((element: any, index:number) => {
          this.selectedMembers(element);
          this.getmemberIndex(element.id);
          return {
            member: {
              members: {
                user: {
                  "phone": element?.phone,
                  "name": element?.name,
                }
              }
            }
          };
        });
        let groupArrayVal = groupData.groups.map((elementVal: any, index:number) => {
          // this.selectedGroup(elementVal.name+'('+ elementVal.id +')');
          this.selectedGroup(elementVal);
          this.getmemberGroup(elementVal.id);
          return {
            group: {
                  // "id": elementVal?.id,
                  "name": elementVal?.name,
            }
          };
        });
        //this.getMemberData = groupData.members ? memberArrayVal : [];
        //this.getGroupData = groupData.groups ? groupArrayVal : [];
        //this.members = groupData.members ? arrayVal : [];
        this.eventImage = groupData?.image;
        this.logoImage = groupData?.logoImage;
        // console.log("logoImage....===>",this.logoImage);
        
        //this.attandanceCount = groupData.attendees?.numberOfMaxAttendees;
        //this.visitorsCount = groupData.attendees?.numberOfMaxWebVisitors;
        this.beforeDay = new Date(groupData?.rsvpEndTime);
        this.beforeDay.setDate(this.beforeDay.getDate() - 1);
        this.createdtAt = new Date(groupData?.createdAt);
        this.createdtAt.setDate(this.createdtAt.getDate());
        //this.alertService.success(response.message);
      }
    });

  }

  //Use Angular DatePipe to format the date
  formatDate(date: Date | undefined): string {
    if (!date) {
      return '';
    }
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  getMaxDate(): Date {
    const today = new Date();
    // Get current date and add 1 year
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    return maxDate;
  }

  currentDate(){
    const currentDay = new Date();
    return currentDay;
  }

  setPackagesForm(packagesValue:any) : FormArray{
    const arrayData : FormArray = new FormArray<any>([]);
    if(packagesValue.length){
      packagesValue.forEach((element:any,index:number) => {
        const PackagesForm = this.formBuilder.group({
        currency: [this.getCurrency],
        packageName: [element?.packageName],
        packageRate: [element?.packageRate],
        description: [element?.description],
        packageLogo: [element?.packageLogo],
        earlyBirdDate: [this.formatDate(element?.earlyBirdDate)],
        earlyBirdRate: [element?.earlyBirdRate],
        isActive: [element?.isActive]
        });
        this.packageLogo[index] =  PackagesForm.value.packageLogo;
        arrayData.push(PackagesForm);
      });
    }
    return arrayData;
  }

  setPackageForm(packageValue:any) : FormArray{
    const packageArrayData : FormArray = new FormArray<any>([]);
    if(packageValue.length){
      packageValue.forEach((element:any) => {
        //console.log("element....",element);
        const PackageForm = this.formBuilder.group({
        //packageName: [element?.packageName],
        packageRate: [element?.packageRate],
        description: [element?.description],
        earlyBirdDate: [this.formatDate(element?.earlyBirdDate)],
        earlyBirdRate: [element?.earlyBirdRate],
        isActive: [element?.isActive]
        //packageLogo: [element?.packageLogo]
        })
        packageArrayData.push(PackageForm)
      });
    }
    return packageArrayData;
  }

  getmemberIndex(memberId:any){
    this.getMemberIndex = this.getMemberData.findIndex((val:any)=> val?.members?.user?.id === memberId);
    this.isMemberOptionDisabled(this.getMemberIndex);
  }

  getmemberGroup(groupId:any){
    this.getGroupIndex = this.getGroupData.findIndex((val:any)=> val?.id === groupId);
    this.isOptionDisabled(this.getGroupIndex);
  }

  getCountryCodes() {
    this.loaderService.show();
    this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.countryData = response.data;  
        this.filteredOptions = response.data;      
      }
    });
  }

  getEventPaymentSettingStatus() {
    const params:any = {};
    params['data']= {
      id: this.storageService.getLocalStorageItem('communtityId'),
    }
    this.loaderService.show();
    this.apolloClient.setModule('getEventPaymentStatus').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getPaymentStatus = response?.data?.eventPaymentSettings;   
      }
    });
  }

  getStateDate(event: any)
  {
        //console.log(event.target.value);

        if(event.target.value != '')
        {
            const params= {
              data:{
                countryCode: event.target.value
              }
            }
            this.loaderService.show();
            this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
              this.loaderService.hide();
              if(response.error) {
                this.alertService.error(response.message);
              } else {
                this.stateData = response.data;
                this.eventForm.controls['firstAddressLine'].setValue('');
                this.eventForm.controls['secondAddressLine'].setValue('');
                this.eventForm.controls['state'].setValue('');
                this.eventForm.controls['zipcode'].setValue('');
                this.eventForm.controls['city'].setValue('');
              }
            });
        }
  }

  getState(country: any)
  {
        //console.log(event.target.value);

        if(country != '')
        {
            const params= {
              data:{
                countryCode: country
              }
            }
            this.loaderService.show();
            this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
              this.loaderService.hide();
              if(response.error) {
                this.alertService.error(response.message);
              } else {
                this.stateData = response.data;
              }
            });
        }
  }

saveData()
{
  
  if(this.eventImage === '' || this.eventImage === null || this.eventImage === undefined){
    this.alertService.error("Event image is required");
    return;
  }
  if(this.logoImage === '' || this.logoImage === null || this.logoImage === undefined){
    this.alertService.error("Logo image is required");
    return;
  }
  if(this.eventForm.value.paymentStatus === '' || this.eventForm.value.paymentStatus === null){
    this.alertService.error("Payment status is required");
    return;
  }
  if(this.eventForm.value.paymentStatus === 'Paid' && this.eventForm.value.paymentCategory === '' || this.eventForm.value.paymentCategory=== null){
    this.alertService.error("Payment category is required");
    return;
  }
  if(this.paymentStatusValue === "Paid" || !this.isRecurringEvent){
    if(this.eventForm.value.fromdate === null || this.eventForm.value.fromdate === "" || this.eventForm.value.fromdate === undefined){
      this.alertService.error("Please select start date");
      return;
    }
    if(this.eventForm.value.todate === null || this.eventForm.value.todate === "" || this.eventForm.value.todate === undefined){
      this.alertService.error("Please select end date");
      return;
    }
  }

  if(this.isRecurringEvent && !this.ismonthly){
    if(this.weeks.length === 0){
      this.alertService.error("Please select week days");
      return;
    }
    if(this.eventForm.value.fromdate === null || this.eventForm.value.fromdate === "" || this.eventForm.value.fromdate === undefined){
      this.alertService.error("Please select start date");
      return;
    }
  }

  if(this.isRecurringEvent && this.ismonthly){
    if(this.dd.length === 0){
      this.alertService.error("Please select date for monthly");
      return;
    }
    if(this.eventForm.value.fromdate === null || this.eventForm.value.fromdate === "" || this.eventForm.value.fromdate === undefined){
      this.alertService.error("Please select start date");
      return;
    }
  }

  if(this.isRecurringEvent && !this.isOccuranceWise){
    if(this.eventForm.value.fromdate === null || this.eventForm.value.fromdate === "" || this.eventForm.value.fromdate === undefined){
      this.alertService.error("Please select start date");
      return;
    }
    if(this.eventForm.value.todate === null || this.eventForm.value.todate === "" || this.eventForm.value.todate === undefined){
      this.alertService.error("Please select end date");
      return;
    }
  }

  if(this.isRecurringEvent && this.isOccuranceWise){
    if(this.eventForm.value?.occurances === 0 || this.eventForm.value?.occurances === null || this.eventForm.value?.occurances === "" || this.eventForm.value?.occurances === undefined){
      this.alertService.error("Please enter the occurance");
      return;
    }
    if(this.eventForm.value?.occurances < 0){
      this.alertService.error("Negative value is not allowed");
      return;
    }
  }

  if(this.eventForm.value.paymentPackage.length!= 0){
    if(this.eventForm.value.paymentCategory === 'per_head'){
      if(this.eventForm.value.paymentPackage[0].packageRate === '' || this.eventForm.value.paymentPackage[0].packageRate === null){
        this.alertService.error("Package rate is required");
        return;
      }
      if(this.eventForm.value.paymentPackage[0].description === '' || this.eventForm.value.paymentPackage[0].description === null){
        this.alertService.error("Package description is required");
        return;
      }
        if(this.eventForm.value.paymentPackage[0].earlyBirdDate){
          if(!this.eventForm.value.paymentPackage[0].earlyBirdRate){
            this.alertService.error(`Package early bird rate is required`);
          return;
          } 
        }
        if(this.eventForm.value.paymentPackage[0].earlyBirdRate){
          if(!this.eventForm.value.paymentPackage[0].earlyBirdDate){
            this.alertService.error(`Package early bird date is required`);
          return;
          } 
        }
       if (this.eventForm.value.paymentPackage[0].earlyBirdDate){
        if(!this.eventId){
          const ctDay = this.formatDate(new Date());
          const earlyDate = this.formatDate(this.eventForm.value.paymentPackage[0].earlyBirdDate);
          if(earlyDate < ctDay){
            this.alertService.error(`Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
            return;
          }
        }
        else{ 
          const createdtAt = this.formatDate(this.createdtAt);
          const earlyDateEdit = this.formatDate(this.eventForm.value.paymentPackage[0].earlyBirdDate);        
          if(earlyDateEdit < createdtAt){
            this.alertService.error(`Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
            return;
          }
        }
      }
    }
    // if(this.eventForm.value.paymentCategory === 'per_head' && this.eventForm.value.paymentPackage[0].packageRate === '' || this.eventForm.value.paymentPackage[0].packageRate === null){
    //   this.alertService.error("Package rate is required");
    //   return;
    // }
    // if(this.eventForm.value.paymentCategory === 'per_head' && this.eventForm.value.paymentPackage[0].description === '' || this.eventForm.value.paymentPackage[0].description === null){
    //   this.alertService.error("Package description is required");
    //   return;
    // }
    
    // if(this.eventForm.value.paymentCategory === 'per_head'){
    // if(this.eventForm.value.paymentPackage[0].earlyBirdDate !== null || this.eventForm.value.paymentPackage[0].earlyBirdDate !== "" && this.eventForm.value.paymentPackage[0].earlyBirdRate === null){
    //   this.alertService.error(`Package early bird rate is required`);
    //   return;
    // }
    // if(this.eventForm.value.paymentPackage[0].earlyBirdRate !== null && this.eventForm.value.paymentPackage[0].earlyBirdDate === null || this.eventForm.value.paymentPackage[0].earlyBirdDate === ""){
    //   this.alertService.error(`Package early bird date is required`);
    //   return;
    // }
  //   if(this.eventForm.value.paymentPackage[0].earlyBirdDate){
  //     if(!this.eventForm.value.paymentPackage[0].earlyBirdRate){
  //       this.alertService.error(`Package early bird rate is required`);
  //     return;
  //     } 
  //   }
  //   if(this.eventForm.value.paymentPackage[0].earlyBirdRate){
  //     if(!this.eventForm.value.paymentPackage[0].earlyBirdDate){
  //       this.alertService.error(`Package early bird date is required`);
  //     return;
  //     } 
  //   }
  //  }
    // if(this.eventForm.value.paymentCategory === 'per_head' && (this.eventForm.value.paymentPackage[0].earlyBirdDate !== null || this.eventForm.value.paymentPackage[0].earlyBirdDate !== '') && (this.eventForm.value.paymentPackage[0].earlyBirdRate === null || this.eventForm.value.paymentPackage[0].earlyBirdRate === '')){
    //   this.alertService.error(`Package early bird rate is required`);
    //   return;
    // }
    // if(this.eventForm.value.paymentCategory === 'per_head' &&  this.eventForm.value.paymentPackage[0].earlyBirdRate !== null || this.eventForm.value.paymentPackage[0].earlyBirdRate !== '' && this.eventForm.value.paymentPackage[0].earlyBirdDate === null || this.eventForm.value.paymentPackage[0].earlyBirdDate === ''){
    //   this.alertService.error(`Package early bird date is required`);
    //   return;
    // }
    // console.log("earlyBirdDate.....",this.eventForm.value.paymentPackage[0].earlyBirdDate);
    // console.log("currentDay....",this.currentDay.setDate(this.currentDay.getDate()));
    // console.log("createdtAt....",this.createdtAt);
    // console.log(this.eventForm.value.paymentPackage[0].earlyBirdDate);
    // console.log(this.eventForm.value.paymentCategory);
    
    // if(this.eventForm.value.paymentCategory === 'per_head'){ 
    //   if (this.eventForm.value.paymentPackage[0].earlyBirdDate){
    //     if(!this.eventId){
    //       const ctDay = this.formatDate(new Date());
    //       const earlyDate = this.formatDate(this.eventForm.value.paymentPackage[0].earlyBirdDate);
    //       if(earlyDate < ctDay){
    //         this.alertService.error(`Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
    //         return;
    //       }
    //     }
    //     else{ 
    //       const createdtAt = this.formatDate(this.createdtAt);
    //       const earlyDateEdit = this.formatDate(this.eventForm.value.paymentPackage[0].earlyBirdDate);        
    //       if(earlyDateEdit < createdtAt){
    //         this.alertService.error(`Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
    //         return;
    //       }
    //     }
    //   }
    // }
  }
  // console.log("length=====>",this.eventForm.value.paymentPackages.length);

  if(this.eventForm.value.paymentPackages.length!= 0){
    if (this.eventForm.value.paymentCategory === 'package_wise') {
      const packages = this.eventForm.value.paymentPackages;

      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];

        //Validate name
        if (!pkg.packageName) {
          this.alertService.error(`Package ${i + 1} name is required`);
          return;
        }

        if (!pkg.packageRate) {
          this.alertService.error(`Package ${i + 1} rate is required`);
          return;
        }

        //Validate description
        if (!pkg.description) {
          this.alertService.error(`Package ${i + 1} description is required`);
          return;
        }

        // Validate logo from external array
        pkg.packageLogo = this.packageLogo[i] || '';
        if (!pkg.packageLogo) {
          this.alertService.error(`Package ${i + 1} logo is required`);
          return;
        }

        // Early bird validations
        const hasEarlyBirdDate = !!pkg.earlyBirdDate;
        const hasEarlyBirdRate = !!pkg.earlyBirdRate;

        if (hasEarlyBirdDate && !hasEarlyBirdRate) {
          this.alertService.error(`Package ${i + 1} early bird rate is required`);
          return;
        }

        if (hasEarlyBirdRate && !hasEarlyBirdDate) {
          this.alertService.error(`Package ${i + 1} early bird date is required`);
          return;
        }

        if (hasEarlyBirdDate) {
          const earlyDateFormatted = this.formatDate(pkg.earlyBirdDate);

          if (!this.eventId) {
            const currentDate = this.formatDate(new Date());
            if (earlyDateFormatted < currentDate) {
              this.alertService.error(
                `Package ${i + 1} Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`
              );
              return;
            }
          } else {
            const createdAtFormatted = this.formatDate(this.createdtAt);
            if (earlyDateFormatted < createdAtFormatted) {
              this.alertService.error(
                `Package ${i + 1} Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`
              );
              return;
            }
          }
        }
      }
    }


    // for(let i=0; i<this.eventForm.value.paymentPackages.length; i++){
    //   if(this.eventForm.value.paymentCategory === 'package_wise' && this.eventForm.value.paymentPackages[i].packageName === '' || this.eventForm.value.paymentPackages[i].packageName === null){
    //     this.alertService.error(`Package ${i+1} name is required`);
    //     return;
    //   }
    //   if(this.eventForm.value.paymentCategory === 'package_wise' && this.eventForm.value.paymentPackages[i].packageRate === '' || this.eventForm.value.paymentPackages[i].packageRate === null){
    //     this.alertService.error(`Package ${i+1} rate is required`);
    //     return;
    //   }
    //   if(this.eventForm.value.paymentCategory === 'package_wise' && this.eventForm.value.paymentPackages[i].description === '' || this.eventForm.value.paymentPackages[i].description === null){
    //     this.alertService.error(`Package ${i+1} description is required`);
    //     return;
    //   }
    //   if(this.eventForm.value.paymentCategory === 'package_wise' && this.eventForm.value.paymentPackages[i].packageLogo === '' || this.eventForm.value.paymentPackages[i].packageLogo === null){
    //     this.alertService.error(`Package ${i+1} logo is required`);
    //     return;
    //   }
    //   if(this.eventForm.value.paymentCategory === 'package_wise'){
    //     if(this.eventForm.value.paymentPackages[i].earlyBirdDate){
    //       if(!this.eventForm.value.paymentPackages[i].earlyBirdRate){
    //         this.alertService.error(`Package ${i+1} early bird rate is required`);
    //       return;
    //       } 
    //     }
    //     if(this.eventForm.value.paymentPackages[i].earlyBirdRate){
    //       if(!this.eventForm.value.paymentPackages[i].earlyBirdDate){
    //         this.alertService.error(`Package ${i+1} early bird date is required`);
    //       return;
    //       } 
    //     }
        // if(this.eventForm.value.paymentPackages[i].earlyBirdRate !== null && this.eventForm.value.paymentPackages[i].earlyBirdDate === null || this.eventForm.value.paymentPackages[i].earlyBirdDate === ""){
        //   this.alertService.error(`Package ${i+1} early bird date is required`);
        //   return;
        // }
        
      // }
      // if(this.eventForm.value.paymentCategory === 'package_wise' && this.eventForm.value.paymentPackages[i].earlyBirdDate !== '' && this.eventForm.value.paymentPackages[i].earlyBirdRate === null){
      //   this.alertService.error(`Package ${i+1} early bird rate is required`);
      //   return;
      // }
      // if(this.eventForm.value.paymentCategory === 'package_wise' &&  this.eventForm.value.paymentPackages[i].earlyBirdRate !== null && this.eventForm.value.paymentPackages[i].earlyBirdDate === ''){
      //   this.alertService.error(`Package ${i+1} early bird date is required`);
      //   return;
      // }
      // console.log(this.eventForm.value.paymentPackages[i].earlyBirdDate);
     
      // if(this.eventForm.value.paymentCategory === 'package_wise'){  
      //   if (this.eventForm.value.paymentPackages[i].earlyBirdDate){
      //     if(!this.eventId){
      //       const ctDay = this.formatDate(new Date());
      //       const earlyDatePackages = this.formatDate(this.eventForm.value.paymentPackages[i].earlyBirdDate);
            
      //       if(earlyDatePackages < ctDay){
      //         this.alertService.error(`Package ${i+1} Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
      //         return;
      //       }
      //     }
      //     else{      
      //       const createdtAt = this.formatDate(this.createdtAt);
      //       const earlyDatePackageEdit = this.formatDate(this.eventForm.value.paymentPackages[i].earlyBirdDate);    
      //       if(earlyDatePackageEdit < createdtAt){
      //         this.alertService.error(`Package ${i+1} Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
      //         return;
      //       }
      //     }
      //   }
      // }
      // if(this.eventForm.value.paymentCategory === 'package_wise' &&  this.eventForm.value.paymentPackages[i].earlyBirdDate !== ''){
      //   if(this.eventId === '' || this.eventId === null || this.eventId === undefined){
      //     if(this.eventForm.value.paymentPackages[i].earlyBirdDate < this.currentDay){
      //       this.alertService.error(`Package ${i+1} Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
      //       return;
      //     }
      //   }
      //   else{          
      //     if(this.eventForm.value.paymentPackages[i].earlyBirdDate < this.createdtAt){
      //       this.alertService.error(`Package ${i+1} Early Bird RATE is applicable only between "Event creation date" AND before "RSVP end date"`);
      //       return;
      //     }
      //   }
        
      // }
    }
  // }
  // if(this.eventForm.value.invitationType === 'Private' && this.memberDataArray.length === 0){
  //   this.alertService.error("Member is required");
  //   return;
  // }

  // if(this.eventForm.value.invitationType === 'Private' && this.memberDataArray.length === 0){
  //   this.alertService.error("Member is required");
  //   return;
  // }

  if(this.eventForm.value.invitationType === 'Private'){
    if(this.groupDataArray.length === 0){
      this.alertService.error("Group is required");
    return;
    }
  } 

  if(this.paymentCategoryValue === 'per_head'){
    this.payPackage = this.eventForm.value.paymentPackage;
  }
  else if(this.paymentCategoryValue === 'package_wise'){
    this.payPackage = this.eventForm.value.paymentPackages;
  }

  if(this.eventForm.value.restrictNumberAttendees && this.eventForm.value.attendanceCounts === 0){
    this.alertService.error("maximum number of attendees count is required");
    return;
  }
  if(this.eventForm.value.restrictNumberAttendees && this.eventForm.value.attendanceCounts === null){
    this.alertService.error("maximum number of attendees count is required");
    return;
  }
  if(this.isShowMaxNumber === true && this.eventForm.value.attendanceCounts < 0){
    this.alertService.error("Negative number is not allowed");
    return;
  }
  if(this.eventForm.value.restrictNumberAttendees && this.eventForm.value.numberOfMaxGuests === null){
    this.alertService.error("maximum number of guests count is required");
    return;
  }
  if(this.isShowMaxNumber === true && this.eventForm.value.numberOfMaxGuests === 0){
    this.alertService.error("maximum number of guests count is required");
    return;
  }
  if(this.isShowMaxNumber === true && this.eventForm.value.numberOfMaxGuests < 0){
    this.alertService.error("Negative number is not allowed");
    return;
  }
  if(this.isShowMaxNumber){
    if(this.eventForm.value.numberOfMaxGuests!== 0 && this.eventForm.value.attendanceCounts!==0){
      if(this.eventForm.value.numberOfMaxGuests > this.eventForm.value.attendanceCounts){
        this.alertService.error("Number of guest must be less than or eaual to number of attandance");
        return;
      }
      // if(this.eventForm.value.attendanceCounts > this.eventForm.value.numberOfMaxGuests){
      //   this.alertService.error("Number of guest must be less than or eaual to number of attandance");
      //   return;
      // }
    }
  }
  if(this.eventForm.value.invitationType === 'Public' && this.isShowWebVisitor ){
    if(this.eventForm.value.webCount === 0 || this.eventForm.value.webCount === null){
      this.alertService.error("maximum number of web visitors  count is required");
      return;
    }
    if(this.isShowWebVisitor && this.eventForm.value.webCount < 0){
      this.alertService.error("Negative number is not allowed");
      return;
    }
    if(this.isShowWebVisitor === true && this.eventForm.value.numberOfMaxGuests === 0 || this.eventForm.value.numberOfMaxGuests === null){
      this.alertService.error("maximum number of guests count is required");
      return;
    }
    if(this.isShowWebVisitor === true && this.eventForm.value.numberOfMaxGuests < 0){
      this.alertService.error("Negative number is not allowed");
      return;
    }
    if(this.isShowMaxNumber || this.eventForm.value?.restrictNumberAttendees){
      if(this.isShowWebVisitor){
        if(this.eventForm.value.numberOfMaxGuests!== 0 && this.eventForm.value.webCount!==0){
          // if(this.eventForm.value.numberOfMaxGuests > this.eventForm.value.webCount){
          //   this.alertService.error("Number of guest must be less than or eaual to number of web visitor");
          //   return;
          // }
          if(this.eventForm.value.webCount > this.eventForm.value.attendanceCounts){
            this.alertService.error("Number of web visitor must be less than or eaual to number of attandance");
            return;
          }
        }
      }
    }
  }
  if(!this.isRecurringEvent && this.eventForm.value.rsvpEndTime === '' || this.eventForm.value.rsvpEndTime === null || this.eventForm.value.rsvpEndTime === undefined){
    this.alertService.error("RSVP End Date is required.");
    return;
  }
  if(this.isShowWebVisitor === false){
    this.visitorsCount = 0;
  }
  if(this.isShowMaxNumber === false){
    this.attandanceCount = 0;
    this.guestCount = 0;
  }
  // console.log("fromdate====>",this.eventForm.value.fromdate);
  
  // console.log(new Date(this.eventForm.value.fromdate), new Date(this.eventForm.value.fromdate).toISOString());
  const fromDate = new Date(this.eventForm.value.fromdate);
  // console.log(fromDate, 'LINEAR FORM DATE')
  const toDate = new Date(this.eventForm.value.todate);
  const rsvpEndDate = new Date(this.eventForm.value.rsvpEndTime);
  const tzName = this.sharedService.getTimezoneName();
  // console.log("tzName=====",tzName);
  
  if (!this.isRecurringEvent) {
    if (this.eventForm.value.fromtime && this.eventForm.value.totime) {
        
        // console.log(fromDate, fromDate.toISOString(), fromDate.toLocaleDateString());
        // Format dates as "YYYY-MM-DD"
        const formattedFromDate = `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`;
        const formattedToDate = `${toDate.getFullYear()}-${(toDate.getMonth() + 1).toString().padStart(2, '0')}-${toDate.getDate().toString().padStart(2, '0')}`;
        const startDateTime = new Date(`${formattedFromDate}T${this.eventForm.value.fromtime}`);
        const endDateTime = new Date(`${formattedToDate}T${this.eventForm.value.totime}`);
        const timeDifference = endDateTime.getTime() - startDateTime.getTime();
        if (isNaN(timeDifference) || timeDifference < 0 || timeDifference > 24 * 60 * 60 * 1000) {
            this.alertService.error("start date and end date must be within 24 hours");
            return;
        }
    }
  }
  const params: any = {};
  params['data'] = {
    //communityId: this.storageService.getLocalStorageItem('communtityId'),
    type: this.eventForm.value.type,
    title: this.eventForm.value.title,
    image: this.eventImage,
    logoImage: this.logoImage,
    description: this.eventForm.value.description,
    venueDetails: {
      firstAddressLine: this.eventForm.value.firstAddressLine,
      secondAddressLine: this.eventForm.value.secondAddressLine,
      city: this.eventForm.value.city,
      state: this.eventForm.value.state,
      country: this.eventForm.value.country,
      zipcode: this.eventForm.value.zipcode,
      phoneCode: this.eventForm.value.phoneCode,
      phoneNo: this.eventForm.value.phoneNo,
    },
    date: {
      from: this.eventForm.value.fromdate ? this.sharedService.getStrDate(fromDate) : "",
      to: this.eventForm.value.todate ? this.sharedService.getStrDate(toDate) : "",
    },   
    invitationType: this.eventForm.value.invitationType,
    // rsvpEndTime: this.eventForm.value.rsvpEndTime.toISOString(),
    rsvpEndTime: this.eventForm.value.rsvpEndTime ? this.sharedService.getStrDate(rsvpEndDate) : "",
    restrictNumberAttendees: this.eventForm.value.restrictNumberAttendees,
    postEventAsCommunity: this.eventForm.value.postEventAsCommunity,
    attendeeListVisibilty: this.eventForm.value.attendeeListVisibilty,
    collectEventPhotos: this.eventForm.value.collectEventPhotos,
    //numberOfMaxAttendees: this.eventForm.value.restrictNumberAttendees ? this.eventForm.value.numberOfMaxAttendees : null,
    numberOfMaxAttendees: this.eventForm.value.attendanceCounts ? this.eventForm.value.attendanceCounts : 0,
    numberOfMaxGuests: this.eventForm.value.numberOfMaxGuests ? this.eventForm.value.numberOfMaxGuests : 0,
    numberOfMaxWebVisitors: this.eventForm.value.webCount ? this.eventForm.value.webCount : 0,
    //paymentStatus: this.eventForm.value.paymentStatus,
    paymentCategory: this.eventForm.value.paymentCategory ? this.eventForm.value.paymentCategory : null,
    paymentPackages: this.payPackage ? this.payPackage : [],
    members: this.memberDataArray ? this.memberDataArray : [],
    groups: this.groupDataArray ? this.groupDataArray : [],
    webvistorRestriction: this.isShowWebVisitor,
    // recurringEvent: this.eventForm.value.recurringEvent,
    // recurringDetails: {
    //   recurringType: this.eventForm.value.recurringType,
    //   occurances: this.eventForm.value.occurances,
    //   dateIndex: this.weeks.length === 0 ? this.dd : this.weeks,
    // }
  }
  // console.log(params, "========PARAMS");
  // return;
  if(this.eventId)
  {
    params['data'].time= {
      from: this.eventForm.value.fromtime,
      to: this.eventForm.value.totime,
      timezone: tzName ? tzName : ''
    }
    if(this.isRecurringEvent){
      params['data'].id = this.getEventId;
      params['data'].communityId = this.storageService.getLocalStorageItem('communtityId');
      params['data'].paymentStatus = this.eventForm.value.paymentStatus;
      params['data'].recurringEvent = this.eventForm.value.recurringEvent,
      params['data'].recurringDetails = {
        recurringType: this.eventForm.value.recurringType,
        occurances: this.eventForm.value.occurances ? this.eventForm.value.occurances : 0,
        dateIndex: this.weeks.length === 0 ? this.dd : this.weeks,
      }
        this.loaderService.show();
            this.apolloClient.setModule("editRecurringEvent").mutateData(params).subscribe((response: any) => {
              if (response.error) {
                this.loaderService.hide();
                this.alertService.error(response.message)
              }
              else {
                this.loaderService.hide();
                this.alertService.error(response.message);
               
                if(this.eventForm.value.invitationType === 'Public'){
                  this.router.navigateByUrl('/events');
                }
                else{
                  this.router.navigateByUrl('/events');
                  // this.router.navigateByUrl('/events/reminder/'+this.eventId);
                }
              }
      });
    }
    else{
      params['data'].id = this.getEventId;
        this.loaderService.show();
            this.apolloClient.setModule("updateEvent").mutateData(params).subscribe((response: any) => {
              if (response.error) {
                this.loaderService.hide();
                this.alertService.error(response.message)
              }
              else {
                this.loaderService.hide();
                this.alertService.error(response.message);
               
                if(this.eventForm.value.invitationType === 'Public'){
                  this.router.navigateByUrl('/events');
                }
                else{
                  // this.router.navigateByUrl('/events/reminder/'+this.eventId);
                  this.router.navigateByUrl('/events');
                }
              }
        });
    }
  }
  else
  {
        params['data'].communityId = this.storageService.getLocalStorageItem('communtityId');
        params['data'].paymentStatus = this.eventForm.value.paymentStatus;
        params['data'].recurringEvent = this.eventForm.value.recurringEvent,
        params['data'].recurringDetails = {
          recurringType: this.eventForm.value.recurringType,
          occurances: this.eventForm.value.occurances,
          dateIndex: this.weeks.length === 0 ? this.dd : this.weeks,
        }
        params['data'].time = {
          from: this.eventForm.value.fromtime,
          to: this.eventForm.value.totime,
          timezone: tzName ? tzName : ''
        }
        this.loaderService.show();
        this.apolloClient.setModule("createEvent").mutateData(params).subscribe((response: any) => {
          if (response.error) {
            this.loaderService.hide();
            this.alertService.error(response.message)
          }
          else {
            this.loaderService.hide();
            this.alertService.error(response.message);
            if(this.eventForm.value.invitationType === 'Public'){
              this.router.navigateByUrl('/events');
            }
            else{
              this.router.navigateByUrl('/events');
              // this.router.navigateByUrl('/events/reminder/'+response.data?.id)
            }
          }
        });
  }
  
}

uploadPackageImage(event: any, imageName: String, index: number) {
  const val = event.target.value.split("\\").pop();
  this.getFileName = val;
  this.openPackageCropImageModal[index] = true;
  this.imagePackageChangedEvent[index] = event;

  if (event.target.files && event.target.files[0]) {
    let size = event.target.files[0].size / 1024;
    if (size > 5120) { 
      this.alertService.error("Image size should be within 2-5MB.");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]); // read file as data url
    reader.onload = (event) => { // called once readAsDataURL is completed
      let imageSrc = event.target?.result;
    }
  }
}

uploadImage(event: any, type: String) {

  const val = event.target.value.split("\\").pop();
  this.getFileName = val;

    if(type == 'eventImage')
    {      
      this.openCropImageModal = true;
      this.imageChangedEvent = event;
    }
    else if(type == 'logoImage')
    {
      //this.getLogoFileName = val;
      this.openLogoCropImageModal = true;
      this.imageLogoChangedEvent = event;
    }
  if (event.target.files && event.target.files[0]) {
    let size = event.target.files[0].size / 1024;
    //console.log('image size----', size);
    if (size > 5120) { //size < 2048
      this.alertService.error("Image size should be within 2-5MB.");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]); // read file as data url
    reader.onload = (event) => { // called once readAsDataURL is completed
      let imageSrc = event.target?.result;
      //console.log('imageSrc----', imageSrc);
    }
  }
  // this.sharedService.uploadFileToS3Bucket(event, imageName,
  //   (err : any, data : any, imageName: any) => {
  //     this.setS3BucketUploadedFilePath(err, data, imageName);
  //   });
}


uploadPackageLogo(event: any, type: String) {

  const val = event.target.value.split("\\").pop();
  this.getFileName = val;

    if(type == 'eventImage')
    {      
      this.openCropImageModal = true;
      this.imageChangedEvent = event;
    }
    else if(type == 'logoImage')
    {
      //this.getLogoFileName = val;
      this.openLogoCropImageModal = true;
      this.imageLogoChangedEvent = event;
    }


  if (event.target.files && event.target.files[0]) {
    let size = event.target.files[0].size / 1024;
    //console.log('image size----', size);
    if (size > 5120) { //size < 2048
      this.alertService.error("Image size should be within 2-5MB.");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]); // read file as data url
    reader.onload = (event) => { // called once readAsDataURL is completed
      let imageSrc = event.target?.result;
      //console.log('imageSrc----', imageSrc);
    }
  }
  // this.sharedService.uploadFileToS3Bucket(event, imageName,
  //   (err : any, data : any, imageName: any) => {
  //     this.setS3BucketUploadedFilePath(err, data, imageName);
  //   });
}


setS3BucketUploadedFilePath (err : any, data : any, type: string) {
  
  if (err) {
          this.alertService.error("There was an error uploading your file");
          return false;
  } else {
    
            if(type == 'eventImage')
            {
                 this.eventImage = data.Location;
            }
            else if(type == 'logoImage')
            {
                 this.logoImage = data.Location;
            } 

          this.alertService.error("Image has been uploaded successfully");
     
        return true;
  }
}

//Image Croped...............
cropImg(event: ImageCroppedEvent, type: string) {
  //console.log("event.......",event);
  this.croppedImage = event.blob;
  if (this.croppedImage && this.croppedImage.type.startsWith('image/')) {
    this.fileUploadService.blobToArrayBuffer(this.croppedImage).then(arrayBuffer => {
      const file = this.fileUploadService.arrayBufferToFile(arrayBuffer, 'cropped-image.jpg', this.croppedImage.type);
      this.imageUrl = file;
    }).catch(err => {
      console.error("Error converting blob to ArrayBuffer:", err);
    });
  } else {
    console.error("Invalid blob type:", this.croppedImage?.type);
  }
  
}

//Package Image Croped...............
cropPackageImg(event: ImageCroppedEvent, type: string, index:number) {
  //console.log("event.......",event);
  this.croppedPackageImage[index] = event.blob;
  
}

closeImage(type: string)
{
    if(type == 'eventImage')
    {
        this.openCropImageModal = false;
    }
    else if(type == 'logoImage')
    {
        this.openLogoCropImageModal = false;
    }
  
}

closePackageImage(index:number){
  this.openPackageCropImageModal[index] = false;
}

// savePackageImage(index:number){
//   this.openPackageCropImageModal[index] = false;
//   this.sharedService.uploadCropedFileToS3Bucket(this.croppedPackageImage[index], this.getFileName, 'packageLogo',
//     (err : any, data : any, imageType: string) => {
//       this.setS3BucketUploadedPackageImageFilePath(err, data, index);
//     });
// }

savePackageImage(index: number) {
  this.openPackageCropImageModal[index] = false;

  const file = this.croppedPackageImage[index];
  if (file instanceof File || file instanceof Blob) {
    this.fileUploadService.blobToBase64(file).then((base64) => {
      const formData = new FormData();
      formData.append('type', 'package-logo-image'); // Use your backend type
      formData.append('images', file);

      this.fileUploadService.sendFile(formData).subscribe({
        next: (res) => {
          this.packageLogo[index] = res.urls[0]; // Ensure 'urls[0]' exists in your backend response
        },
        error: (err) => {
          console.error('Upload error:', err);
        }
      });
    });
  } else {
    console.error('Invalid file object for package image:', file);
  }
}



setS3BucketUploadedPackageImageFilePath (err : any, data : any, index:number) {
  
  if (err) {
          this.alertService.error("There was an error uploading your file");
          return false;
  } else {
          this.packageLogo[index] = data.Location;  
          this.paymentPackages.at(index).patchValue({packageLogo : data.Location});
          this.alertService.error("Image has been uploaded successfully");
        return true;
  }
}

saveImage(type: string)
{
  if(type == 'eventImage')
  {
      this.openCropImageModal = false;
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
        this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
          this.eventImage = base64; // only for preview
          const formData = new FormData();
          formData.append('type', 'community-profile-image');
          formData.append('images', this.imageUrl); // this.imageUrl is File
          this.fileUploadService.sendFile(formData).subscribe({
            next: (res) => {
              // console.log('Upload success:', res);
              this.eventImage = res.urls[0]
            },
            error: (err) => {
              console.error('Upload error:', err);
            }
          });

        }).catch(err => {
          console.error("Error converting to base64:", err);
        });
      } else {
        console.error("Invalid file object:", this.imageUrl);
      }
  }
  else if(type == 'logoImage')
  {
      this.openLogoCropImageModal = false;
      if (this.imageUrl instanceof File || this.imageUrl instanceof Blob) {
        this.fileUploadService.blobToBase64(this.imageUrl).then((base64) => {
          this.logoImage = base64; // only for preview
          const formData = new FormData();
          formData.append('type', 'community-profile-image');
          formData.append('images', this.imageUrl); // this.imageUrl is File
          this.fileUploadService.sendFile(formData).subscribe({
            next: (res) => {
              // console.log('Upload success:', res);
              this.logoImage = res.urls[0]
            },
            error: (err) => {
              console.error('Upload error:', err);
            }
          });

        }).catch(err => {
          console.error("Error converting to base64:", err);
        });
      } else {
        console.error("Invalid file object:", this.imageUrl);
      }
  }
  
  

  // this.sharedService.uploadCropedFileToS3Bucket(this.croppedImage, this.getFileName, type, 
  //   (err : any, data : any, imageType: string) => {
  //     this.setS3BucketUploadedFilePath(err, data, imageType);
  //   });
}

  cancel(){
    this.router.navigateByUrl('/events');
  }

  deleteImage(type : string)
  {
    if(type == 'eventImage')
    {
      this.eventImage = '';
    }
    else if(type == 'logoImage')
    {
      this.logoImage = '';
    } 
  }

  deletePackageImage(index:number){
    this.packageLogo[index] = ''
  }

  searchCountry(event:any){
    this._filter(event.target.value)
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    this.filteredOptions = this.countryData.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
    if(this.filteredOptions.length == 0){
    }
  }

  addCountryCode(country:CountryCodes){
    this.selectedCountryCode = country;
    //console.log("country............",this.selectedCountryCode);
  }

  setEndDate(event:any)
  {
          this.todate = event.target.value;
          this.rsvpEndTime = new Date(this.todate);
          this.rsvpEndTime.setDate(this.rsvpEndTime.getDate() - 1);

          this.eventForm.patchValue({
            todate: '',  
            rsvpEndTime: '',  
          });
          this.clearPackageDate();
          this.clearDate();
  }

  checkPostEventCommunity(event:any)
  {
        if(event.target.checked === false)
        {
            event.target.checked = true;
        }
  }

  
  // ---- date input test -- start --- 

  // openCalendar(): void {
  //   const dateInput = document.getElementById('dateInput') as HTMLInputElement;
  //   dateInput.type = 'date';
  //   dateInput.focus();
  // }

  // ---- date input test -- end --- 



  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our group
    if (value) {
      //console.log("value......",value);
      this.groups.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
    this.groupCtrl.setValue(null);
  }

  addMember(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our member
    if (value) {
      this.members.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();

    this.memberCtrl.setValue(null);
  }

  remove(group: string): void {
    const index = this.groups.indexOf(group);
    if (index >= 0) {
      this.groups.splice(index, 1);
      this.groupDataArray.splice(index,1);
      this.announcer.announce(`Removed ${group}`);
    }
  }


  removeMember(member: string): void {
    const index = this.members.indexOf(member);
    if (index >= 0) {
      this.members.splice(index, 1);
      this.memberDataArray.splice(index,1);
      this.announcer.announce(`Removed ${member}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.groupDataArray.push(event.option.value);
    this.groups.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.groupCtrl.setValue(null);
  }

  selectedMember(event: MatAutocompleteSelectedEvent): void {
    this.memberDataArray.push(event.option.value);
    this.members.push(event.option.viewValue);
    this.memberInput.nativeElement.value = '';
    this.memberCtrl.setValue(null);
    //console.log(this.memberDataArray);
  }

  selectedMembers(value:any): void {
    this.memberDataArray.push(value.id);
    this.members.push(value.name+'('+ value.phone +')');
    //this.memberInput.nativeElement.value = '';
    this.memberCtrl.setValue(null);
    //console.log(this.memberDataArray);
  }

  selectedGroup(value:any): void {
    this.groupDataArray.push(value?.id);
    this.groups.push(value?.name);
    //this.fruitInput.nativeElement.value = '';
    this.groupCtrl.setValue(null);
    //this.getCommunityGroup();
  }

  // Add the trackGroup function
  trackGroup(index: number, group: any): any {
    return group; // or provide a unique identifier for tracking
  }

  // Add the trackMember function
  trackMember(index: number, member: any): any {
    return member; // or provide a unique identifier for tracking
  }


  getCommunityGroup(){
    const params= {
      data:{
        communityId: this.storageService.getLocalStorageItem('communtityId'),
        isActive:true
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityGroupList').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getGroupData = response.data.groups ? response.data.groups : '';
        // if(this.eventId)
        // {
        //     this.getEventDetails();
        // }
        //console.log("getGroupData......",this.getGroupData);
        this.getGroupData.forEach((element:any,index:number) => {
          element.isDisabled = false;
        });
      }
    });
  }

  // isOptionDisabled(index:number){
  //   this.getGroupData[index].isDisabled = true;
  // }

  isOptionDisabled(index: number) {
    if (this.getGroupData && this.getGroupData[index]) {
        this.getGroupData[index].isDisabled = true;
    }
  }


  

  cancelGroup(groupData:any){
    const data1 = groupData.split('(')[0];
    const data2 = data1.split(')')[0];
    this.getGroupData.map((val:any,index:number)=>{
      if(val.name === data2){
        if(this.eventId && (this.getGroupData[index].id === val.id)){
          const params:any={};
          params['data']= {
            id: this.getGroupData[index].id,
            type: "group",
            eventId: this.eventId
          }
          this.removeGroupSubscriber = this.apolloClient.setModule('removeGroupOrMemberEvent').mutateData(params).subscribe({
            next:(response: GeneralResponse)=>{
              if(response.error){
                this.loaderService.hide();
                this.alertService.error(response.message);
                this.getGroupData[index].isDisabled = true;
              }
              else{
                this.loaderService.hide();
                this.alertService.error(response.message);
                this.getGroupData[index].isDisabled = false;
                this.remove(groupData);
              }
            },
            error: err =>{
              console.log(err);        
            }
          })
        }
        else{
          this.getGroupData[index].isDisabled = false;
          this.remove(groupData);
        }
      }
    })
  }

  onGoTo(page: number): void {
    this.current = page
    this.getMemberList(this.current);
  }

  public onNext(page: number): void {
    this.current = page + 1;
    this.getMemberList(this.current);
  }

  public onPrevious(page: number): void {
    this.current = page - 1;
    this.getMemberList(this.current);
  }

  getMemberList(page : Number){
    //console.log(this.eventId);
    const params:any = {}
    if(this.eventId){
      params['data']= {
          communityId: this.storageService.getLocalStorageItem('communtityId'),
          eventId: this.eventId,
          page: page
      }
    }
    else{
      params['data']= {
        communityId: this.storageService.getLocalStorageItem('communtityId'),
        page: page
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getMemberData = response.data?.members;
        this.totalData = response?.data?.total;
          this.from = response?.data?.from;
          this.to = response?.data?.to;
          if(response?.data?.total !== 0) {
            this.totalPageNo = Math.ceil(response?.data?.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }
        this.initializeMembers();
        if(this.eventId)
        {
            this.getEventDetails();
        }
        // this.getMemberData.forEach((element:any,index:number) => {
        //   element.isMemberDisabled = false;
        // });
      }
    });
  }

  initializeMembers(): void {
    if (this.getMemberData) {
      this.getMemberData.forEach((element: any) => {
        element.isMemberDisabled = false;
      });
    }
  }
  
  isMemberOptionDisabled(index:number){
    this.getMemberData[index].isMemberDisabled = true;
  }

  cancelMember(memberData:any){
    const memberdata1 = memberData.split('(')[1];
    const memberdata2 = memberdata1.split(')')[0];
    this.getMemberData.map((value:any,index:number)=>{
      if(value?.members?.user?.phone === memberdata2){
        if(this.eventId && (this.getMemberData[index].id === value.id)){
          const params:any={};
          params['data']= {
            id: this.getMemberData[index].members.memberId,
            type: "member",
            eventId: this.eventId
          }
          this.removeGroupSubscriber = this.apolloClient.setModule('removeGroupOrMemberEvent').mutateData(params).subscribe({
            next:(response: GeneralResponse)=>{
              if(response.error){
                this.loaderService.hide();
                this.alertService.error(response.message);
                this.getMemberData[index].isMemberDisabled = true;
              }
              else{
                this.loaderService.hide();
                this.alertService.error(response.message);
                this.getMemberData[index].isMemberDisabled = false;
                this.removeMember(memberData);
              }
            },
            error: err =>{
              console.log(err);        
            }
          })
        }
        else{
          this.getMemberData[index].isMemberDisabled = false;
          this.removeMember(memberData);
        }
        //this.getMemberData[index].isMemberDisabled = false;
      }
    })
  }

  attendeesCountIncrement(){
    // this.attandanceCount++;
    this.attandanceCount = this.eventForm.value.attendanceCounts;
    this.attandanceCount++;
     this.eventForm.patchValue({
      attendanceCounts: this.attandanceCount
    })
  }

  attendeesCountDecrement(){
    //this.attandanceCount--;
    this.attandanceCount = this.eventForm.value.attendanceCounts;
    this.attandanceCount--;
     this.eventForm.patchValue({
      attendanceCounts: this.attandanceCount
    })
  }

  guestCountIncrement(){
    // this.attandanceCount++;
    this.guestCount = this.eventForm.value.numberOfMaxGuests;
    this.guestCount++;
     this.eventForm.patchValue({
      numberOfMaxGuests: this.guestCount
    })
  }

  guestCountDecrement(){
    //this.attandanceCount--;
    this.guestCount = this.eventForm.value.numberOfMaxGuests;
    this.guestCount--;
     this.eventForm.patchValue({
      numberOfMaxGuests: this.guestCount
    })
  }

  visitorsCountIncrement(){
    //this.visitorsCount++;
    this.visitorsCount = this.eventForm.value.webCount;
    this.visitorsCount++;
     this.eventForm.patchValue({
      webCount: this.visitorsCount
    })
  }

  visitorsCountDecrement(){
    // this.visitorsCount--;
    this.visitorsCount = this.eventForm.value.webCount;
    this.visitorsCount--;
     this.eventForm.patchValue({
      webCount: this.visitorsCount
    })
  }

  paymentSatusChange(event:any){
    this.paymentStatusValue = event.target.value;
    if (this.paymentStatusValue === 'Free'){
      this.paymentCategoryValue = [];
      this.eventForm.controls['paymentCategory'].setValue('');
    }
  }

  paymentSatusChanged(value:any){
    this.paymentStatusValue = value;
    if (this.paymentStatusValue === 'Free'){
      this.paymentCategoryValue = [];
      this.eventForm.controls['paymentCategory'].setValue('');
    }
  }

  paymentCategoryChange(event:any){
    this.paymentCategoryValue = event.target.value;
  }

  paymentCategoryChanged(value:any){
    this.paymentCategoryValue = value;
  }

  addFields(){
    const val = this.createPaymentPackage();
    this.paymentPackages.push(val);
  }

  createPaymentPackages() {
      return this.formBuilder.group({
        packageName: [''],
        packageRate: [''],
        description: [null],
        currency: [this.getCurrency],
        packageLogo: [''],
        earlyBirdDate: [null],
        earlyBirdRate: [null],
        isActive:[true]
      });
  }

  createPaymentPackage() {
    return this.formBuilder.group({
      packageName: [null],
      packageRate: [''],
      description: [null],
      currency: [this.getCurrency],
      packageLogo: [null],
      earlyBirdDate: [null],
      earlyBirdRate: [null],
      isActive:[true]
    });
}

  getInvitationTypeValue(event:any){
    if(event.target.value === "Private"){
      this.isPrivateInvitation = true;
      this.isShowWebVisitor = false;
      this.eventForm.controls['webvistorRestriction'].setValue(false);
      this.eventForm.controls['webCount'].setValue(0);
    }
    if(event.target.value === "Members"){
      this.isPrivateInvitation = false;
      this.isShowWebVisitor = false;
      this.eventForm.controls['webvistorRestriction'].setValue(false);
      this.eventForm.controls['webCount'].setValue(0);
    }
    if(event.target.value === "Public"){
      this.isPrivateInvitation = false;
      // this.isShowWebVisitor = true;
    }
    // else{
    //   this.isPrivateInvitation = false;
    // }
  }

  getInvitationTypeValues(value:any){
    if(value === "Private"){
      this.isPrivateInvitation = true;
    }
    else{
      this.isPrivateInvitation = false;
    }
  }


  removeDetails(i:any){
    // console.log("index........",i);
    this.paymentPackages.removeAt(i);
  }

  showWebVistor(event:any){
    if(event.target.checked === true){
      this.isShowWebVisitor = true;
    }
    else{
      this.isShowWebVisitor = false;
      this.eventForm.controls['webCount'].setValue(null);
      this.eventForm.controls['numberOfMaxGuests'].setValue(null);
    }
  }

  showMaxAttandace(event:any){
    if(event.target.checked === true){
      this.isShowMaxNumber = true;
    }
    else{
      this.isShowMaxNumber = false;
      this.eventForm.controls['attendanceCounts'].setValue(null);
      this.eventForm.controls['numberOfMaxGuests'].setValue(null);
    }
  }

  changeSatus(event:any){

  }

  setEarlyBirdEndDate(event:any){
    const lastDay = event.target.value;
    const previousDay = new Date(lastDay);
    // previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setDate(previousDay.getDate());
    this.beforeDay = previousDay.toISOString().split('T')[0];
    if(this.paymentCategoryValue === "package_wise"){
      //this.alertService.error("Early Bird Date are applicable only between 'Event Start date' AND before 'RSVP end date'.");
      this.clearDate();
    }
    if(this.paymentCategoryValue === "per_head"){
      //this.alertService.error("Early Bird Date are applicable only between 'Event Start date' AND before 'RSVP end date'.");
      this.clearPackageDate();
    }
   
  }
  clearPackageDate(){
    const arrayVal1: FormArray = new FormArray<any>([]);
    let payVal1 = this.eventForm.value.paymentPackage;
    //console.log("payVal.....", payVal);
    if (payVal1.length) {
      payVal1.forEach((element: any, index: number) => {
        const PackagesFormVal1 = this.formBuilder.group({
          currency: [this.getCurrency],
          //packageName: [null],
          packageRate: [element?.packageRate],
          description: [element?.description],
          //packageLogo: [element?.packageLogo],
          earlyBirdRate: [element?.earlyBirdRate],
          earlyBirdDate: [''],
          isActive: [true]
        });
        arrayVal1.push(PackagesFormVal1);
      });
      this.eventForm.setControl('paymentPackage', arrayVal1);
    }
  }
  clearDate(){
    const arrayVal: FormArray = new FormArray<any>([]);
    let payVal = this.eventForm.value.paymentPackages;
    //console.log("payVal.....", payVal);
    if (payVal.length) {
      payVal.forEach((element: any, index: number) => {
        const PackagesFormVal = this.formBuilder.group({
          currency: [this.getCurrency],
          packageName: [element?.packageName],
          packageRate: [element?.packageRate],
          description: [element?.description],
          packageLogo: [element?.packageLogo],
          earlyBirdRate: [element?.earlyBirdRate],
          earlyBirdDate: [''],
          isActive: [true]
        });
        arrayVal.push(PackagesFormVal);
      });
      this.eventForm.setControl('paymentPackages', arrayVal);
    }
  }

  /**Using for recurring events toggle */
  recurringEventToggle(event: any){
    if(event.target.checked){
      this.isRecurringEvent = true;
    }
    else{
      this.eventForm.controls['fromdate'].setValue('');
      this.eventForm.controls['todate'].setValue('');
      this.eventForm.controls['rsvpEndTime'].setValue('');
      this.eventForm.controls['occurances'].setValue(0);
      this.eventForm.controls['dateIndex'].setValue(0);
      this.weeks = [];
      this.dd = [];
      this.isOccuranceWise = false;
      this.ismonthly = false;
      this.isRecurringEvent = false;
    }
  }

  /**Using for changed value for weekly or monthly */
  statusChange(event: any){
    if(event.target.value === 'monthly'){
      this.weeks = [];
      this.ismonthly = true;
    }
    else{
      this.dd = [];
      this.eventForm.controls['dateIndex'].setValue(0);
      this.ismonthly = false;
      
    }
  }

  occuranceWise(event: any){
    if(event.target.value === 'occurance'){
      this.eventForm.controls['fromdate'].setValue('');
      this.eventForm.controls['todate'].setValue('');
      this.eventForm.controls['rsvpEndTime'].setValue('');
      // this.eventForm.controls['rsvpEndTime'].setValue('');
      this.isOccuranceWise = true
    }
    else{
      this.eventForm.controls['rsvpEndTime'].setValue('');
      this.eventForm.controls['occurances'].setValue(0);
      this.isOccuranceWise = false;
    }
  }

  /** Using for increment the quanity count*/
  countIncrement(){
    this.totalQuaintyCount = this.eventForm.value.occurances;
    this.totalQuaintyCount++;
     this.eventForm.patchValue({
      occurances: this.totalQuaintyCount
    })
   }

   /** Using for decrement the quanity count*/
   countDecrement(){
    this.totalQuaintyCount = this.eventForm.value.occurances;
    this.totalQuaintyCount--;
     this.eventForm.patchValue({
      occurances: this.totalQuaintyCount
    })
   }

   weekDayChange(event:any){
    if(event.target.checked){
      this.weeks.push(parseInt(event.target.value))
    }
    else if(!event.target.checked){
      const index = this.weeks.indexOf(parseInt(event.target.value));
      if (index > -1) { // only splice array when item is found
        this.weeks.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
   }

  //  dateChange(event: MatDatepickerInputEvent<Date>) {
  //   if (event.value instanceof Date) {
  //       const selectedDate: Date = event.value;
  //       const day: number = selectedDate.getDate();
  //       this.dd = []; 
  //       this.dd.push(day)
  //       console.log(this.dd);
  //       // Do whatever you need with the day value here
  //   } else {
  //       console.error("Invalid date selected");
  //   }
  // }
  dateChange(event:any){
    this.dd = []; 
    this.dd.push(parseInt(event.target.value));
  }

  //block decimal number
  allowOnlyIntegers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab']; // allow only safe keys
  
    // Block ArrowDown to prevent decrementing into negative numbers
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      return;
    }
  
    // Allow navigation keys and digits only
    if (!/^[0-9]$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault(); // Block non-integer characters
    }
  }
  
  
}

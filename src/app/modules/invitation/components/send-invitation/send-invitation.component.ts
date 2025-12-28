import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';

import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { paramService } from 'src/app/shared/params/params';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import {environment} from 'src/environments/environment'

declare var window:any;
@Component({
  selector: 'app-send-invitation',
  templateUrl: './send-invitation.component.html',
  styleUrls: ['./send-invitation.component.css']
})
export class SendInvitationComponent implements OnInit,OnChanges {
  $modal: any;
  communityService: any;
  communities: any;
  //alertService: any;
  StorageService: any;
  token : any;
  showFamilyMembers : boolean = false;
  invitationDetail : any;

  sms : boolean = true;  
  loadData : boolean = false;
  editable : boolean = false;
  invalidTokenMessage : string = '';
  userInvitationForm!:FormGroup;
  rejectInvitationForm!:FormGroup;
  blockInvitationForm!:FormGroup;
  states : any = [];
  filteredOptions!: Array<CountryCodes>;
  countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  
  constructor(private activatedRoute:ActivatedRoute,
              private loaderService: LoaderService,
              private apolloClient: ApolloClientService,
              private alertService: AlertService,
              private formBuilder : FormBuilder,
              private router: Router,
              private paramService:paramService,
              private validator: ValidatorService
              )

  {

  }

  ngOnInit(): void {

    this.initForm();

    this.activatedRoute.paramMap.subscribe(params => {
      this.token = params.get('token'); 
      this.getPassiveUserInvitationDetails(); 
    });

    this.getCountryCodes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  initForm(){

    this.userInvitationForm = this.formBuilder.group({
      id:[''],
      userType: [''],
      language: [''],
      firstname: ['',[Validators.required]],
      // middlename: [''],
      // lastname: ['',[Validators.required]],
      email: ['',[Validators.required]],
      //phoneCode:[''],
      phone: [''],
      firstAddressLine: ['',[Validators.required]],
      secondAddressLine: [''],
      country: [''],
      city: ['',[Validators.required,this.validator.isEmpty,]],
      state: [''],
      zipcode: ['',[Validators.required,this.validator.isEmpty,this.validator.checkPinCode]],
      hobbies: [''],
      profession: [''],
      aboutYourself: [''],
    });

    this.rejectInvitationForm = this.formBuilder.group({
      message: ['',[Validators.required]],
      userId: [],
      communityId: [],
      response: 'Reject',
      emailAnnouncement:  [],
      smsAnnouncement: [],
      emailEvent: [],
      smsEvent: [],
      invitationType: []
    });

    this.blockInvitationForm = this.formBuilder.group({
      message: [''],
      userId: [],
      communityId: [],
      response: 'Block',
      emailAnnouncement:  [],
      smsAnnouncement: [],
      emailEvent: [],
      smsEvent: [],
      invitationType: []
    });
  }

  searchCountry(event:any){
    this._filter(event.target.value)
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredOptions = this.countryCodes.filter((countryCode:any) => countryCode.name.toLowerCase().includes(filterValue));
  }

  addCountryCode(country:CountryCodes){
    this.selectedCountryCode = country;
  }

  getCountryCodes() {
    
    this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.countryCodes = response.data;
        this.filteredOptions = response.data;
      }
    });
  }

  changeState(code:any){
    //this.hasCountry = true;
    const params= {
      data:{
        countryCode: code.target.value
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.states = response.data;
      }
    });

  }

  getState(code:any){
    //this.hasCountry = true;
    const params= {
      data:{
        countryCode: code
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.states = response.data;
      }
    });

  }

  getPassiveUserInvitationDetails(){
    const params:any = {};
    params['data'] = {
      token: this.token
    }   
    
    this.loaderService.show();
    this.apolloClient.setModule('passiveUserInvitationDetails').queryData(params).subscribe((response: GeneralResponse) => {      

      //console.log('====>',response);

      if(response.error) {
        //console.log('======>', response.message );
        //this.alertService.error(response.message);
        //this.loadData = true;
          this.invalidTokenMessage = response.message;
      } else {
        //console.log('======', response);
            this.invalidTokenMessage = ''; 
            this.invitationDetail = response.data;
            this.setFormData(this.invitationDetail);
        //this.loadData = true;

        }
    });
    this.loaderService.hide();
    
  }
  
  setFormData(invitationDetail : any)
  {
      this.userInvitationForm.patchValue({
        id:  invitationDetail.userDetails.id ? invitationDetail.userDetails.id : '',
        userType: invitationDetail.communityDetails[0].members.roleName ? (invitationDetail.communityDetails[0].members.roleName.charAt(0).toUpperCase() + invitationDetail.communityDetails[0].members.roleName.slice(1)) : '',
        firstname: invitationDetail.userDetails.name ? invitationDetail.userDetails.name : '',//invitationDetail.userDetails.name ? this.formatName(invitationDetail.userDetails.name, 'first_name') : '',
        // middlename: invitationDetail.userDetails.name ? this.formatName(invitationDetail.userDetails.name, 'middlename') : '',
        // lastname: invitationDetail.userDetails.name ? this.formatName(invitationDetail.userDetails.name, 'last_name') : '',
        language: invitationDetail.userDetails.language ? invitationDetail.userDetails.language : '',
        email: invitationDetail.userDetails.email ? invitationDetail.userDetails.email : '',
        //phoneCode: invitationDetail.userDetails.phoneCode ? invitationDetail.userDetails.phoneCode: '',
        phone: invitationDetail.userDetails.phone ? invitationDetail.userDetails.phoneCode+ ' '+invitationDetail.userDetails.phone : '',
        firstAddressLine: invitationDetail.userDetails.firstAddressLine ? invitationDetail.userDetails.firstAddressLine : '',
        secondAddressLine: invitationDetail.userDetails.secondAddressLine ? invitationDetail.userDetails.secondAddressLine : '',
        country: invitationDetail.userDetails.country ? invitationDetail.userDetails.country : '',
        state: invitationDetail.userDetails.state ? invitationDetail.userDetails.state : '',
        city: invitationDetail.userDetails.city ? invitationDetail.userDetails.city : '',
        zipcode: invitationDetail.userDetails.zipcode ? invitationDetail.userDetails.zipcode : ''
      });

      this.getState(invitationDetail.userDetails.country);
  }


  acceptModal(id:any){
   
    this.$modal.hide();
    this.communityService.switchCommunity(id);
  }

  acceptOpenModal(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("acceptInvitation")
    );
      this.$modal.show();
  }

  acceptInvitation()
  {     

      let data = {
        userId: this.invitationDetail?.userDetails.id,
        communityId: this.invitationDetail?.communityDetails[0]?.id,
        response: 'Accept',
        emailAnnouncement:  this.invitationDetail?.emailSmsPreferences?.emailAnnouncement,
        smsAnnouncement: this.invitationDetail?.emailSmsPreferences?.smsAnnouncement,
        emailEvent: this.invitationDetail?.emailSmsPreferences?.emailEvent,
        smsEvent: this.invitationDetail?.emailSmsPreferences?.smsEvent,
        message: '',
        invitationType: this.invitationDetail?.invitationType
      }   

      const params:any = {};
              params['data'] = data;

            this.loaderService.show();
            this.apolloClient.setModule('invitationResponse').mutateData(params).subscribe((response: GeneralResponse) => {      

              this.loaderService.hide();    

              if(response.error) {
                 this.$modal.hide(); 
                 this.alertService.error(response.message);
                // this.router.navigate(['/invitation/thank-you/'+this.token]);                  
              } 
              else
              {
                    // this.$modal.hide(); 
                    // this.alertService.error(response.message);

                    this.paramService.updateInvitationDetail(this.invitationDetail);
                    this.$modal.hide(); 
                    window.location.href = `${environment.orgURL}/${this.invitationDetail?.communityDetails[0]?.communitySetting?.slug}/Home`;
                    // this.router.navigate(['/invitation/thank-you']);
                    // this.router.navigate([`${environment.orgURL}/${this.invitationDetail?.communityDetails[0]?.communitySetting?.slug}/Home`]);
              }
            });
            
            // this.paramService.updateInvitationDetail(this.invitationDetail);
            // this.$modal.hide(); 
            // this.router.navigate(['/invitation/thank-you']);
  }

  rejectOpenModal(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("rejectInvitation")
    );
      this.$modal.show();
  }

  rejectInvitation()
  {     

       this.rejectInvitationForm.patchValue({
        userId: this.invitationDetail?.userDetails.id,
        communityId: this.invitationDetail?.communityDetails[0]?.id,
        emailAnnouncement:  this.invitationDetail?.emailSmsPreferences?.emailAnnouncement,
        smsAnnouncement: this.invitationDetail?.emailSmsPreferences?.smsAnnouncement,
        emailEvent: this.invitationDetail?.emailSmsPreferences?.emailEvent,
        smsEvent: this.invitationDetail?.emailSmsPreferences?.smsEvent,
        invitationType: this.invitationDetail?.invitationType
      });

      
      const params:any = {};
      params['data'] = this.rejectInvitationForm.value;

        this.loaderService.show();
        this.apolloClient.setModule('invitationResponse').mutateData(params).subscribe((response: GeneralResponse) => {      

          this.loaderService.hide();    
       
          if(response.error) {
            this.$modal.hide(); 
            this.alertService.error(response.message);
          } 
          else
          {
                this.$modal.hide(); 
                this.alertService.error(response.message);
                this.getPassiveUserInvitationDetails();
          }
        });  
        
  }

  blockOpenModal(){
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("blockInvitation")
    );
      this.$modal.show();
  }

  blockInvitation()
  {
    this.blockInvitationForm.patchValue({
      userId: this.invitationDetail?.userDetails.id,
      communityId: this.invitationDetail?.communityDetails[0]?.id,
      emailAnnouncement:  this.invitationDetail?.emailSmsPreferences?.emailAnnouncement,
      smsAnnouncement: this.invitationDetail?.emailSmsPreferences?.smsAnnouncement,
      emailEvent: this.invitationDetail?.emailSmsPreferences?.emailEvent,
      smsEvent: this.invitationDetail?.emailSmsPreferences?.smsEvent,
      invitationType: this.invitationDetail?.invitationType
    });

    const params:any = {};
    params['data'] = this.blockInvitationForm.value;

      this.loaderService.show();
      this.apolloClient.setModule('invitationResponse').mutateData(params).subscribe((response: GeneralResponse) => {      

        this.loaderService.hide();    
     
        if(response.error) {
          this.$modal.hide(); 
          this.alertService.error(response.message);
        } 
        else
        {
              this.$modal.hide(); 
              this.alertService.error(response.message);
              this.getPassiveUserInvitationDetails();
        }
      });
  }

  openCloseModal()
  {
        this.showFamilyMembers = !this.showFamilyMembers;
  }
 
  formatName(name: string, type: string)
  {
    let display_name : String = '';

      if(name!='')
      {
        let nameArray = name.split(" ");

          if(nameArray.length > 0)
          {
                if(type == 'first_name')
                {
                   display_name = nameArray[0];
                }
                else if(type == 'middlename' && nameArray.length==3)
                {
                   display_name = nameArray[1];
                }
                else if(type == 'last_name')
                {
                    if(nameArray.length==2)
                    {
                        display_name = nameArray[1];
                    }
                    else if(nameArray.length==3)
                    {
                        display_name = nameArray[2];
                    }
                    
                }
          }
      }
      
      
      return display_name;
  }

  enableEdit()
  {
        this.editable = true;
  }

  completeEdit()
  {

    if(this.userInvitationForm.valid)
    {

            this.editable = false;

          // console.log('----------------', this.userInvitationForm.value);

          let passiveUserData = this.userInvitationForm.value;
          delete passiveUserData.email;
          delete passiveUserData.phone;
          delete passiveUserData.userType;

            const params:any = {};
              params['data'] = passiveUserData;

            this.loaderService.show();
            this.apolloClient.setModule('updatePassiveUserInvitationDetails').mutateData(params).subscribe((response: GeneralResponse) => {      
        
            //console.log('====>',response);
        
              if(response.error) {
                //console.log('======>', response.message );
                this.alertService.error(response.message);
              } 
              else
              {
                    this.alertService.error(response.message);
                    //this.getPassiveUserInvitationDetails(); 
                }
            });
            this.loaderService.hide();
    }


      
  }

  cancelEdit()
  {
      this.editable = false;
      //this.getPassiveUserInvitationDetails(); 
  }

  updatePreference(event:any, type:string)
  {
      //console.log(event.target.checked);

      let value = event.target.checked;

      if(type == 'smsEvent')
      {
            this.invitationDetail.emailSmsPreferences.smsEvent = value;
      }
      else if(type == 'smsAnnouncement')
      {
            this.invitationDetail.emailSmsPreferences.smsAnnouncement = value;
      }
      else if(type == 'emailEvent')
      {
            this.invitationDetail.emailSmsPreferences.emailEvent = value;
      }
      else if(type == 'emailAnnouncement')
      {
            this.invitationDetail.emailSmsPreferences.emailAnnouncement = value;
      }
    
  }

  isNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }

}

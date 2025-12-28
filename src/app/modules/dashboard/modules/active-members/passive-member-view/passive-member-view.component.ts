import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';

@Component({
  selector: 'app-passive-member-view',
  templateUrl: './passive-member-view.component.html',
  styleUrls: ['./passive-member-view.component.css']
})
export class PassiveMemberViewComponent implements OnInit, OnDestroy {
  comName!: string;
  memberDetails: any;
  image: any = "assets/images/header-user.png";
  passiveUserEditForm!: FormGroup;
  countrySubscriber!: Subscription;
  stateSubscriber!: Subscription;
  filteredOptions!: Array<CountryCodes>;
  getState: any;
  code!: string;
  arrYear: any;
  addActiveMemberDetails:any;
  current: number = 1;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private formBuilder : FormBuilder,
  ){

  }

  ngOnInit(): void {
    this.comName = this.storageService.getLocalStorageItem('communityName');
    this.initForm();
    this.getPassiveMemberDetails();
    this.getYear();
    this.getCountryCodes();
  }

  ngOnDestroy(): void {
     if(this.countrySubscriber){
      this.countrySubscriber.unsubscribe();
    }
    if(this.stateSubscriber){
      this.stateSubscriber.unsubscribe();
    }
  }

  initForm(){
    this.passiveUserEditForm = this.formBuilder.group({
      name: [''],
      email: [''],
      phone: [''],
      secondaryPhone: [''],
      aboutYourself: [''],
      gender: [''],
      firstAddressLine: [''],
      secondAddressLine: [''],
      yearOfBirth: [''],
      country: [''],
      state: [''],
      city: [''],
      zipcode: [''],
      hobbies: [],
      profession: []
    })
  }

  /**get year for year of birth */
  getYear(){
    const currentYear = (new Date()).getFullYear();
    const range = (start:any, stop:any, step:any) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    //console.log("year..........",range(currentYear, currentYear - 50, -1));
    this.arrYear = range(currentYear, currentYear - 123, -1);
  }

  getPassiveMemberDetails(){
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const params = {
        getUserByIdId: id,
    }
    this.loaderService.show();
    this.apolloClient.setModule('getUserByID').queryData(params).subscribe((response: GeneralResponse) => {    
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
      } else {
        this.loaderService.hide();
        this.memberDetails = response.data;
        this.addActiveMemberDetails = response?.data?.familyMembers;
        this.patchUserData();
        this.changeState('');
        console.log("memberDetails======", response.data);
        
      }
    });
  }


  patchUserData(){
    this.image = this.memberDetails.profileImage ? this.memberDetails.profileImage : 'assets/images/header-user.png';
    this.passiveUserEditForm.patchValue({
      name: this.memberDetails.name ? this.memberDetails.name : 'N/A',
      email: this.memberDetails.email ? this.memberDetails.email : 'N/A',
      phone: this.memberDetails.phone ? this.memberDetails.phoneCode + ' ' +this.memberDetails.phone : 'N/A',
      secondaryPhone: this.memberDetails.secondaryPhone ? this.memberDetails.phoneCode+ ' ' +this.memberDetails.secondaryPhone : 'N/A',
      gender: this.memberDetails.gender ? this.memberDetails.gender : 'N/A',
      firstAddressLine: this.memberDetails.firstAddressLine ? this.memberDetails.firstAddressLine : 'N/A',
      secondAddressLine: this.memberDetails.secondAddressLine ? this.memberDetails.secondAddressLine : 'N/A',
      yearOfBirth: this.memberDetails.yearOfBirth ? this.memberDetails.yearOfBirth : 'N/A',
      country: this.memberDetails.countryCode ? this.memberDetails.countryCode : 'N/A',
      state: this.memberDetails.state ? this.memberDetails.state : 'N/A',
      city: this.memberDetails.city ? this.memberDetails.city : 'N/A',
      zipcode: this.memberDetails.zipcode ? this.memberDetails.zipcode : 'N/A',
      hobbies: this.memberDetails.hobbies ? this.memberDetails.hobbies.toString().trim() : 'N/A',
      profession: this.memberDetails.profession ? this.memberDetails.profession.toString().trim() : 'N/A',
      aboutYourself: this.memberDetails.aboutYourself ? this.memberDetails.aboutYourself : 'N/A',
    });
  }

   /**Using for get the country codes */
   getCountryCodes() {
    this.loaderService.show();
    this.countrySubscriber = this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.filteredOptions = response.data;
      }
    });
  }

  /**Using for state change in depends on country */
  changeState(event:any){
    if(!event){
      this.code = this.memberDetails?.countryCode;
    }
    else{
      this.code = event.target.value;
    }
    const params= {
      data:{
        countryCode: this.code
      }
    }
    this.loaderService.show();
    this.stateSubscriber = this.apolloClient.setModule('getState').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getState = response.data;
        if(event){
          this.passiveUserEditForm.controls['firstAddressLine'].setValue('');
          this.passiveUserEditForm.controls['secondAddressLine'].setValue('');
          this.passiveUserEditForm.controls['state'].setValue('');
          this.passiveUserEditForm.controls['city'].setValue('');
          this.passiveUserEditForm.controls['zipcode'].setValue('');
        }
      }
    });
    this.loaderService.hide();
  }

}

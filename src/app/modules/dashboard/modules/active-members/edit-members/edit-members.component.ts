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
  selector: 'app-edit-members',
  templateUrl: './edit-members.component.html',
  styleUrls: ['./edit-members.component.css']
})
export class EditMembersComponent implements OnInit,OnDestroy {
  arrYear: any;
  userId: any;
  memberId: any;
  familyMemberEditForm!: FormGroup;
  filteredOptions!: Array<CountryCodes>;
  countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  getMemberDetaisSubscriber!: Subscription;
  getMemberDetails!: any;

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
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.userId = params.get('id');
        this.memberId = params.get('memberId');
      },
      error: err => {}
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getYear();
    this.getCountryCodes();
    this.getFamilyMemberDetails();
  }

  ngOnDestroy(): void {
    if(this.getMemberDetaisSubscriber){
      this.getMemberDetaisSubscriber.unsubscribe();
    }
  }

  initForm(){
    this.familyMemberEditForm = this.formBuilder.group({
      name: [''],
      email: [''],
      ageOfMinority:[''],
      relationType: [''],
      countryCode: [''],
      phone: [''],
      yearOfBirth: [''],
      gender: [''],
    })
  }

  /**get year for year of birth */
  getYear(){
    const currentYear = (new Date()).getFullYear();
    const range = (start:any, stop:any, step:any) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    //console.log("year..........",range(currentYear, currentYear - 50, -1));
    this.arrYear = range(currentYear, currentYear - 123, -1);
  }

  /**Search country using country name for filter */
  searchCountry(event:any){
    this._filter(event.target.value)
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
    if(this.filteredOptions.length == 0){
    }
  }

  getCountryCodes() {
    this.loaderService.show();
    this.apolloClient.setModule('getCountryCodes').queryData().subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.countryCodes = response.data;
        this.filteredOptions = response.data;
      }
    });
  }

  addCountryCode(country:CountryCodes){
    this.selectedCountryCode = country;
  }

  /**Using for patch data */
  patchUserData(){
    this.familyMemberEditForm.patchValue({
      name: this.getMemberDetails.memberName ? this.getMemberDetails.memberName : '',
      email: this.getMemberDetails.email ? this.getMemberDetails.email : '',
      ageOfMinority: this.getMemberDetails.ageOfMinority ? this.getMemberDetails.ageOfMinority : '',
      relationType: this.getMemberDetails.relationType ? this.getMemberDetails.relationType : '',
      phone: this.getMemberDetails.phone ? this.getMemberDetails.phone : '',
      yearOfBirth: this.getMemberDetails.yearOfBirth ? this.getMemberDetails.yearOfBirth : '',
      gender: this.getMemberDetails.gender ? this.getMemberDetails.gender : '',
      countryCode: this.getMemberDetails.phoneCode ? this.getMemberDetails.phoneCode : '',
    });
  }

 /**Get Family member Details....... */
 getFamilyMemberDetails(){
  const params = {
    data:{
      userId: this.userId,
      familyMemberId: this.memberId,
    }
  }
  this.loaderService.show();
  this.getMemberDetaisSubscriber = this.apolloClient.setModule('getFamilyMemberDetails').queryData(params).subscribe({
    next: (response:GeneralResponse) =>{
      if(response.error){
        this.loaderService.hide();
        this.alertService.error(response.message);
        return;
      }
      else{
        this.loaderService.hide();
        this.getMemberDetails = response.data;
        this.patchUserData();
      }
    },
    error: err=>{
      console.log(err);
    }
  })
  this.loaderService.hide();
}

/**Update data saved...... */
saveData(){
  if(this.familyMemberEditForm.value.name === null || this.familyMemberEditForm.value.name === '' || this.familyMemberEditForm.value.name === undefined){
    this.alertService.error("Name is required");
    return;
  }
  // if(this.familyMemberEditForm.value.ageOfMinority === "spouse"){
  //   if(this.familyMemberEditForm.value.email === null || this.familyMemberEditForm.value.email === '' || this.familyMemberEditForm.value.email === undefined){
  //     this.alertService.error("Email is required");
  //     return;
  //   }
  //   if(this.familyMemberEditForm.value.countryCode === null || this.familyMemberEditForm.value.countryCode === '' || this.familyMemberEditForm.value.countryCode === undefined){
  //     this.alertService.error("Phone code is required");
  //     return;
  //   }
  //   if(this.familyMemberEditForm.value.phone === null || this.familyMemberEditForm.value.phone === '' || this.familyMemberEditForm.value.phone === undefined){
  //     this.alertService.error("Phone is required");
  //     return;
  //   }
  // }
  if(this.familyMemberEditForm.value.ageOfMinority === null || this.familyMemberEditForm.value.ageOfMinority === '' || this.familyMemberEditForm.value.ageOfMinority === undefined){
    this.alertService.error("User type is required");
    return;
  }
  if(this.familyMemberEditForm.value.relationType === null || this.familyMemberEditForm.value.relationType === '' || this.familyMemberEditForm.value.relationType === undefined){
    this.alertService.error("Realtion is required");
    return;
  }
  
  if(this.familyMemberEditForm.value.yearOfBirth === null || this.familyMemberEditForm.value.yearOfBirth === '' || this.familyMemberEditForm.value.yearOfBirth === undefined){
    this.alertService.error("Year of birth is required");
    return;
  }
  if(this.familyMemberEditForm.value.gender === null || this.familyMemberEditForm.value.gender === '' || this.familyMemberEditForm.value.gender === undefined){
    this.alertService.error("Gender is required");
    return;
  }

  const params: any = {};
  params['data']={
    userId: this.userId,
    id: this.memberId,
    firstName: this.familyMemberEditForm.value.name,
    email: this.familyMemberEditForm.value.email,
    memberType: this.familyMemberEditForm.value.ageOfMinority,
    relationType: this.familyMemberEditForm.value.relationType,
    phoneCode: this.familyMemberEditForm.value.countryCode,
    phone: this.familyMemberEditForm.value.phone,
    yearOfBirth: this.familyMemberEditForm.value.yearOfBirth,
    gender: this.familyMemberEditForm.value.gender,
  }
  console.log("params======", params);

  this.loaderService.show();
      this.apolloClient.setModule("adminUpdateFamilyMember").mutateData(params).subscribe((response: any) => {
        if (response.error) {
          this.loaderService.hide();
          this.alertService.error(response.message)
        }
        else {
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('/active-members/view/'+this.userId);
        }
  });
  
}
}

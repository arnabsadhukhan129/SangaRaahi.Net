import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CommunityService } from 'src/app/shared/services/community.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
declare var window:any;
@Component({
  selector: 'app-has-user',
  templateUrl: './has-user.component.html',
  styleUrls: ['./has-user.component.css']
})
export class HasUserComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() userDetails:any;
  addExistMemberForm!: FormGroup;
  $modal: any;
  hasMember: boolean = false;
  filteredOptions!: Array<CountryCodes>;
  countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  getState: any;
  communityId!: string;
  getRole!: string;

  constructor(
    private builder : FormBuilder,
    private authService: AuthService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private communityService: CommunityService,
    private storageService: StorageService,
    private router: Router,
  ){}

 ngOnInit(): void {
  //console.log("userDetails.......",this.userDetails);
  this.communityId = this.storageService.getLocalStorageItem('communtityId');
  this.$modal = new window.bootstrap.Modal(
    document.getElementById("addMemberToYourCommunity")
  );
  this.$modal.show();
  this.initForm();
  this.patchData();
  this.getCountryCodes();
  this.getUserRole();
 }


 ngOnChanges(changes: SimpleChanges): void {
  //console.log("userDetails.......",this.userDetails);
  if (this.$modal) {
    this.$modal.show();
  } 

  // this.$modal.show();
  this.initForm();
  this.patchData();
 }
 

 initForm(){
  this.addExistMemberForm = this.builder.group({
    communityId:[this.communityId],
    userRole: ['',[Validators.required]],
    language: [''],
    gender: [''],
    firstname: [''],
    middlename: [''],
    lastname: [''],
    email: [''],
    countryCode: [''],
    phoneCode: [''],
    phone: [''],
    addressLine1: [''],
    addressLine2: [''],
    country: [''],
    state: [''],
    city: [''],
    zipcode: [''],
  })
 }

 ngAfterViewInit(): void {
 
 }
 patchData(){
  const lastnameValue = this.userDetails?.response?.data?.user?.name.trim().split(" ");
  this.addExistMemberForm?.patchValue({
    firstname: this.userDetails.response.data.user.name ? this.userDetails.response.data.user.name.split(" ",1) : '',
    lastname: this.userDetails.response.data.user.name ? lastnameValue[lastnameValue.length-1] : '',
    email: this.userDetails.params.data.email ? this.userDetails.params.data.email : '',
    phone: this.userDetails.params.data.phone ? this.userDetails.params.data.phoneCode +' '+this.userDetails.params.data.phone  : '',
  });
}

 addCommunityMember(){
  this.$modal.hide();
  this.hasMember = true;
 }

 searchCountry(event:any){ 
  this._filter(event.target.value)
}

private _filter(value: string) {
  const filterValue = value.toLowerCase();

  this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
  if(this.filteredOptions.length == 0){
    //this.loginForm.controls['countryCode'].reset()
  }
}

addCountryCode(country:CountryCodes){
  this.selectedCountryCode = country;
  //console.log("country............",this.selectedCountryCode);
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
      //console.log(this.filteredOptions);
            
    }
  });
}

changeState(code:any){
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
      this.getState = response.data;
     // console.log(this.getState);     
    }
  });
}

hasPhone(){
  if(this.userDetails.params.data.phone){
    return true;
  }
  return false;
}

hasCountryCode(){
  if(this.userDetails.params.data.phoneCode){
    return true;
  }
  return false;
}

hasEmail(){
  if(this.userDetails.params.data.email){
    return true;
  }
  return false;
}

save(){
  const saveData = this.addExistMemberForm.value;
  
  //validation..........
  if(saveData.userRole === null || saveData.userRole === ''){
    this.alertService.error("User type is required");
    return;
  }
  if(saveData.language === null || saveData.language === ''){
    this.alertService.error("Language is required");
    return;
  }
  //End validation.......

  const params:any={};
  params['data'] = {
    communityId: this.communityId,
    userId: this.userDetails.response.data.user?.id,
    userRole: this.addExistMemberForm.controls['userRole'].value,
    //language: this.addExistMemberForm.controls['language'].value,
  };

  this.loaderService.show();
     this.apolloClient.setModule("onboardExistUser").mutateData(params).subscribe((response:any) => {
      if(response.error){
        this.loaderService.hide();
        this.alertService.error(response.message)
      }
       else{
        this.loaderService.hide();
        this.alertService.error(response.message);
        this.router.navigateByUrl('active-members/track')
       }
  });
  //this.loaderService.hide();
}

cancel(){
  this.router.navigateByUrl('active-members/track');
}

  /**get the user role */
  getUserRole(){
    const params= {
      data:{
        id: this.storageService.getLocalStorageItem('communtityId')
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('currentUserRole').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getRole = response.data?.role;
      }
    });
  }

}

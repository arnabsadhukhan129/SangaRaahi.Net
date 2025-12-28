import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { validation } from 'src/app/shared/validator/validation';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.css']
})
export class SearchUserComponent implements OnInit {
  findForm!: FormGroup;
  createMemberForm!:FormGroup
  countryCodes!: Array<CountryCodes>;
  filteredOptions!: Array<CountryCodes>;
  filteredOptions1!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  selectedCountryCode1!: CountryCodes;
  memberFormBlock: boolean=false;
  memberFormBlock1: boolean=false;
  alertMsg: string = '';
  data: any;
  userDetails:any;
  changeUserDetails: boolean = false;
  comName!: string;
  constructor(
    private builder : FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private validator: ValidatorService
  ){}
  ngOnInit(): void {
    this.comName = this.storageService.getLocalStorageItem('communityName');
    this.generateSearchForm();
    this.getCountryCodes();
  }

  generateSearchForm() {
    this.findForm = new FormGroup({
      // email: new FormControl(''),
      countryCode:new FormControl('',[Validators.required]),
      phone: new FormControl('',[Validators.required,this.validator.isEmpty,this.validator.isMobileNumber])
    });
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

  numericOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
      return false;
    }
    return true;
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

  findUser(){
    const phone = this.findForm.controls['phone'].value;
    const countryCode= this.selectedCountryCode;
    if(countryCode === null || countryCode === undefined || countryCode.code === ''){
      this.alertService.error("Country is required");
      return;
    }
    if(countryCode.dialCode === null || countryCode.dialCode === ''){
      this.alertService.error("Dial code is missing");
      return;
    }
    if(phone === null || phone === ''){
      this.alertService.error("Mobile number is required");
      return;
    }
    const params = {
      data:{
        //email:this.findForm.controls['email'].value,
        phone: phone.toString(),
        countryCode: countryCode?.code,
        phoneCode: countryCode?.dialCode,
      }
    };
    this.data = {params,country:this.selectedCountryCode};
    this.loaderService.show();
    this.apolloClient.setModule('findUserByPhoneMail').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      //console.log("response.........",response);
      if(response.error && response.code!== 404) {
        this.alertService.error(response.message);
        this.memberFormBlock = false;
        this.memberFormBlock1 = false;
        this.alertMsg = '';
        return;
      }
      else if(response.error && response.code === 404){
        this.memberFormBlock = true;
        this.memberFormBlock1 = false;
        this.alertMsg = '';
        return;
      }
      else {
        if(response.data === null || '' || undefined){
          //this.alertService.error(response.message);
          this.alertMsg = response.message;
          this.memberFormBlock1 = false;
          this.memberFormBlock = false;
          return;
        }
        else{
          this.memberFormBlock1 = true;
          this.memberFormBlock = false;
          this.alertMsg = '';
          //console.log(response.data);
        }
        }
        this.changeUserDetails = true;
        this.userDetails = {response,country:this.selectedCountryCode,params,changeUserDetails:this.changeUserDetails};
    });
  }

  back(){
    this.router.navigateByUrl('active-members/track')
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

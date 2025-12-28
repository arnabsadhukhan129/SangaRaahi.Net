import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { T } from '@angular/cdk/keycodes';
@Component({
  selector: 'app-no-user',
  templateUrl: './no-user.component.html',
  styleUrls: ['./no-user.component.css']
})
export class NoUserComponent implements OnInit, OnChanges {
  @Input() data :any;
  addMemberForm!:FormGroup;
  hideSection:boolean = false;
  filteredOptions!: Array<CountryCodes>;
  countryCodes!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  //hasSpouse: boolean = false;
  disabledOption: boolean = false;
  communityId!: string;
  getState: any;
  arrYear: any;
  hasCountry: boolean = false;
  requiredEmail: boolean = false;
  requirePhoneCode: boolean = false;
  requiredPhone: boolean = false;
  index!:number;
  code!: string;
  getRole!: string;
  getType!:string;

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
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
    this.initForm();
    this.patchData();
    this.getCountryCodes();
    this.getYear();
    this.getUserRole();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
    this.patchData();
    this.getCountryCodes();
  }

  initForm(){
    this.addMemberForm = this.builder.group({
      communityId:[this.communityId],
      userRole: ['',[Validators.required]],
      language: [''],
      gender: [''],
      firstname: ['',[Validators.required]],
      middlename: [''],
      lastname: ['',[Validators.required]],
      email: ['',[Validators.required, this.validator.isEmpty,this.validator.isEmail]],
      countryCode: [this.data.params.data.countryCode],
      phoneCode: [this.data.params.data.phoneCode],
      phone: [''],
      yearOfBirth: ['',[Validators.required]],
      addressLine1: ['',[Validators.required]],
      addressLine2: [''],
      country: ['',[Validators.required]],
      state: ['',[Validators.required]],
      city: ['',[Validators.required]],
      zipcode: ['',[Validators.required,this.validator.isEmpty]],
      smsEvent:[true],
      smsAnnouncement:[true],
      emailEvent:[true],
      emailAnnouncement:[true],
      familyMember: this.builder.array([])
      // members: this.builder.array([
      //   this.builder.group({
      //     firstName:[''],
      //     middleName:[''],
      //     lastName:[''],
      //     memberType:[''],
      //     yearOfBirth:[''],
      //     gender: [''],
      //     email:[''],
      //     phone:[''],
      //   })
      // ])
    })
  }

  hasEmail(){
    if(this.data.params.data.email){
      return true;
    }
    return false;
  }

  hasPhone(){
    if(this.data.params.data.phone){
      return true;
    }
    return false;
  }

  hasCountryCode(){
    if(this.data.params.data.phoneCode){
      return true;
    }
    return false;
  }

  patchData(){
    this.addMemberForm?.patchValue({
      email: this.data.params.data.email ? this.data.params.data.email : '',
      phone: this.data.params.data.phone ? this.data.params.data.phoneCode+' '+this.data.params.data.phone : '',
      //countryCode: this.data.country ? this.addCountryCode(this.data.country)  : '',
    });
  }

  get familyMember() : FormArray{
    return this.addMemberForm.get('familyMember') as FormArray
  }

  addFields(){
    this.hideSection = true;
    const val =this.builder.group({
      firstName:['',[Validators.required]],
      middleName:[''],
      lastName:['',[Validators.required]],
      memberType:['',[Validators.required]],
      relationType: ['',[Validators.required]],
      yearOfBirth:['',[Validators.required]],
      gender: [''],
      userRole:['member'],
      email:[''],
      countryCode:[''],
      phoneCode:[''],
      phone:[''],
      hasSpouse: false,
      smsEvent:[false],
      smsAnnouncement:[false],
      emailEvent:[false],
      emailAnnouncement:[false]
    });
    this.familyMember.push(val);
  }

  searchCountry(event:any){
    this._filter(event.target.value)
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
    if(this.filteredOptions.length == 0){
    }
  }

  addCountryCode(country:CountryCodes, i: any){
    // console.log("country.....",country);
    
    this.selectedCountryCode = country;
    this.familyMember.at(i).patchValue({
      countryCode: this.selectedCountryCode?.code,
      phoneCode:  this.selectedCountryCode?.dialCode
    })
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
        // console.log("filteredOptions......",this.filteredOptions);
        
      }
    });
  }

  saveData(){
    const saveData = this.addMemberForm.value;
    saveData.phone = this.data.params.data.phone;    
    //Validation.............
    const phoneregex = /^(\+\d{1,3}[- ]?)?\d{10,11}$/;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const INCAregex = /^\s*([A-Za-z0-9]{6})?$/;
    const UKregex = /^\s*([A-Za-z0-9]{5,7})?$/;
    const USregex = /^\s*([0-9]{5,6})?$/;
    if(saveData.country.length!=0){
      if(saveData.country === 'IN' || saveData.country === 'CA'){
        if(!saveData.zipcode.match(INCAregex)){
          this.alertService.error("Zip code must be 6 characters");
          return;
        }
      }
      if(saveData.country === 'GB'){
        if(!saveData.zipcode.match(UKregex)){
          this.alertService.error("Zip code should be between 5 to 7 characters");
          return;
        }
      }
      if(saveData.country === 'US'){
        if(!saveData.zipcode.match(USregex)){
          this.alertService.error("Zip code should be between 5 to 6 characters");
          return;
        }
      }
    }
    // console.log("saveData...........",saveData);
    if(saveData.familyMember.length!= 0){
      if(saveData.familyMember[this.index].memberType === 'adult'){
        if(saveData.familyMember[this.index].email === '' || saveData.familyMember[this.index].email === null){
          this.alertService.error("Email is required");
          return;
        }
        if(!saveData.familyMember[this.index].email.match(emailRegex)){
          this.alertService.error("Invalid Email");
          return;
        }
        if(saveData.familyMember[this.index].countryCode === '' || saveData.familyMember[this.index].countryCode === null){
          this.alertService.error("Phone code is required");
          return;
        }
        if(saveData.familyMember[this.index].phone === '' || saveData.familyMember[this.index].phone === null){
          this.alertService.error("Phone is required");
          return;
        }
        if(!saveData.familyMember[this.index].phone.match(phoneregex)){
          this.alertService.error("Phone number must be 10 digits or 11 digits");
          return;
        }
      }
      if(saveData.familyMember[this.index].memberType === 'spouse'){
        if(this.requiredEmail && saveData.familyMember[this.index].email === '' || saveData.familyMember[this.index].email === null){
          this.alertService.error("Email is required");
          return;
        }
        if(!saveData.familyMember[this.index].email.match(emailRegex)){
          this.alertService.error("Invalid Email");
          return;
        }
        if(this.requirePhoneCode && saveData.familyMember[this.index].countryCode === '' || saveData.familyMember[this.index].countryCode === null){
          this.alertService.error("Phone code is required");
          return;
        }
        if(this.requiredPhone && saveData.familyMember[this.index].phone === '' || saveData.familyMember[this.index].phone === null){
          this.alertService.error("Phone is required");
          return;
        }
        if(!saveData.familyMember[this.index].phone.match(phoneregex)){
          this.alertService.error("Phone number must be 10 digits or 11 digits");
          return;
        }
      }
      if(saveData.familyMember[this.index].memberType === 'minor'){   
        if(saveData.familyMember[this.index].phone){
          if(saveData.familyMember[this.index].countryCode === '' || saveData.familyMember[this.index].countryCode === null){
            this.alertService.error("Phone code is required");
            return;
          }
          if(!saveData.familyMember[this.index].phone.match(phoneregex)){
            this.alertService.error("Phone number must be 10 digits or 11 digits");
            return;
          }
        }
        if(saveData.familyMember[this.index].email){
          if(!saveData.familyMember[this.index].email.match(emailRegex)){
            this.alertService.error("Invalid Email");
            return;
          }
        }
      }
    }
    // console.log("saveData...........",saveData);
    // return;
    //validation End...............
    const arr = saveData.familyMember;
    arr.forEach(function(v:any){ delete v.hasSpouse });
    this.addMemberForm.setControl('familyMember', this.familyMember);
    const params:any={};
    // console.log("saveData...........",saveData);
    // return;
    params['data'] = saveData;
     this.loaderService.show();
     this.apolloClient.setModule("onboardPassiveMember").mutateData(params).subscribe((response:any) => {
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
  }

  cancel(){
    this.router.navigateByUrl('active-members/track');
  }

  // getValue(realtion:any,index:number,data:any){
  //   this.getType = realtion.value;
  //   this.index = index;
  //   this.loaderService.show();
  //   if(realtion.value === 'spouse'){
  //   data.hasSpouse= true;
  //   this.disabledOption = true;
  //   }
  //   else{
  //     data.hasSpouse = false;
  //   }
  //   this.loaderService.hide();
  // }

  getValue(realtion: any, index: number, data: any) {
    
    this.getType = realtion.value;
    this.index = index;
    const familyMember = this.familyMember.at(index);
    // console.log(familyMember.get('relationType'));
    familyMember.get('relationType')?.setValue("")
    // console.log(this.addMemberForm.value.familyMember[index].relationType);
    const memberTypeControl = familyMember.get('memberType');
    // this.addMemberForm.value.familyMember[index].relationType = "";
    if (memberTypeControl) {
      memberTypeControl.setValue(realtion.value);
  
      this.loaderService.show();
  
      if (realtion.value === 'spouse') {
        // Set toggles to true by default for spouse or adult
        familyMember.patchValue({
          smsEvent: true,
          smsAnnouncement: true,
          emailEvent: true,
          emailAnnouncement: true
        });
        data.hasSpouse = realtion.value === 'spouse';  // Only for spouse
        this.disabledOption = realtion.value === 'spouse';  // Disable option for spouse
      } else {
        // Reset toggles for other member types
        familyMember.patchValue({
          smsEvent: false,
          smsAnnouncement: false,
          emailEvent: false,
          emailAnnouncement: false
        });
        data.hasSpouse = false;
      }
  
      this.loaderService.hide();
    }
  }
  
  

  spouseCheck(data:any){
    if(data.hasSpouse) {
      this.requiredEmail = true;
      this.requiredPhone = true;
      this.requirePhoneCode = true;
      return true;
    }
    this.requiredEmail = false;
    this.requiredPhone = false;
    this.requirePhoneCode = false;
    return false;
  }

  changeState(code:any){
    this.code = code.target.value;
    //console.log(this.code);
    this.hasCountry = true;
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
        //console.log(this.getState);
      }
    });
  }

  getYear(){
    const currentYear = (new Date()).getFullYear();
    const range = (start:any, stop:any, step:any) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
    //console.log("year..........",range(currentYear, currentYear - 50, -1));
    this.arrYear = range(currentYear, currentYear - 123, -1);
  }

  removeDetails(i:any){
    // console.log("index........",i);
    this.familyMember.removeAt(i);
  }

  isNumber(evt:any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
  }

  onlyCapsValue(event:any){
    //console.log( event.target.value);
    let value = event.target.value;
    // $('input').keyup(function(){
       let val = value.toUpperCase();
       //console.log("val......",val);
       
    //   $(this).val(val)
    //  })
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

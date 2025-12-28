import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { validation } from 'src/app/shared/validator/validation';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationTokenService } from '../../services/notification-token.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  countryCodes!: Array<CountryCodes>;
  filteredOptions!: Array<CountryCodes>;
  selectedCountryCode!: CountryCodes;
  disabledButton: boolean = false;
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationTokenService
  ){}

  ngOnInit(): void {
    this.init();
    this.getCountryCodes();
  }

  init(){
    this.loginForm = new FormGroup({
      countryCode:new FormControl(null,[Validators.required,validation.cannotContainSpace]),
      phone: new FormControl(null,[Validators.required,Validators.min(10000000),Validators.max(9999999999999)])
      //phone: new FormControl(null,[Validators.required, Validators.pattern("^[7-9][0-9]{9}$")])

      //"^[7-9][0-9]{9}$" ---> india

      //^(1\s?)?(\d{3}|\(\d{3}\))[\s\-]?\d{3}[\s\-]?\d{4}$


    })
  }

  numericOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    //if (charCode == 101 || charCode == 69 || charCode == 45 || charCode == 43) {
      if ((charCode < 48 || charCode > 57) && charCode !== 190){
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

  searchCountry(event:any){
    this._filter(event.target.value)
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    this.filteredOptions = this.countryCodes.filter(countryCode => countryCode.name.toLowerCase().includes(filterValue));
    if(this.filteredOptions.length == 0){
      this.loginForm.controls['countryCode'].reset();
    }
  }

  addCountryCode(country:CountryCodes){
    this.selectedCountryCode = country;
    //console.log("country............",this.selectedCountryCode);

  }


  submit(){
    const phone = (this.loginForm.controls['phone'].value).trim();
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
    this.notificationService.requestPermissionForNotification().then((currentToken: string) => {
      if(currentToken) {
        //console.log("TOKEN ACQUIRED");
        //console.log(currentToken);
        // TODO send token data to the server
        this.authService.login(phone.toString(),countryCode.code,countryCode.dialCode, currentToken);
      } else {
        console.log("Token could not be fetched");
        this.authService.login(phone.toString(),countryCode.code,countryCode.dialCode, '');
      }
    }).catch(error => {
      console.log("An error occurred when error occurred: ", error);
      this.authService.login(phone.toString(),countryCode.code,countryCode.dialCode, '');
    })
    // this.authService.login(phone.toString(),countryCode.code,countryCode.dialCode, '');
    // const data = {
    //   data:{
    //     phone: phone.toString(),
    //     countryCode: countryCode.code,
    //     phoneCode: countryCode.dialCode
    //   }
    // }
    // this.loaderService.show();
    // this.apolloClient.setModule("registerByPhone").mutateData(data).subscribe((response:GeneralResponse) => {
    //       if(response.error) {
    //         // Sow toaster
    //         console.log("error",response.error);
    //         this.alertService.error(response.message);
    //       } else {
    //         this.alertService.success("Otp send to the registered mobile number");
    //         // Redirect to the otp verify page.
    //         this.router.navigateByUrl('verify-otp');
    //       }
    //       this.loaderService.hide();
    //     });
  }

  onEnterKey(event: Event) {
  const keyboardEvent = event as KeyboardEvent;
  if (this.loginForm.valid) {
    this.submit();
  } else {
    keyboardEvent.preventDefault();
  }
}


}

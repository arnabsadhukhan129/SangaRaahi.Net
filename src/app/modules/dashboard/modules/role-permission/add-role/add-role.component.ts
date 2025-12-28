import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit, OnDestroy {
  roleForm!: FormGroup;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  myControl = new FormControl('');
  // options: string[] = ['One', 'Two', 'Three', 'Four', 'Five'];
  filteredOptions!: any;
  options!: any;
  saveRole!:any;
  roleSaveSubscriber!:Subscription;
  roleName!: any;
  slug!:any;
  constructor(
    private alertService: AlertService,
    private sharedService: SharedService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private validator: ValidatorService,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    this.generateForm();
    this.getMemberList();
    this.activatedRoute.paramMap.subscribe(params => {
      this.roleName = params.get('newRole'); 
      this.slug = params.get('slug');
    })
    this.patchData();
    
    // this.filteredOptions = this.options;
  }

  ngOnDestroy(): void {
    if(this.roleSaveSubscriber){
      this.roleSaveSubscriber.unsubscribe();
    }
  }

  generateForm(): void {
    this.roleForm = this.formBuilder.group({
      roleName: [''],
      member: ['']
    });
  }

  patchData(){
    this.roleForm.patchValue({
      roleName: this.roleName ? this.roleName : ''
    })
  }

  addRole(val:any){
    this.saveRole = val?.members?.user?.id;
    // console.log("saveRole=====",this.saveRole);
    
    // this.roleForm.controls['member'].setValue(val?.members?.user?.phone);
  }

  save(){
    if(this.roleName===null){
      this.saveData();
    }
    else{
      this.saveAsssignMember();
    }
  }

  saveData(): void {
    this.roleForm.controls['member'].setValue(this.saveRole);
    if(this.roleForm.value.roleName === "" || this.roleForm.value.roleName === null || this.roleForm.value.roleName === undefined){
      this.alertService.error("Role name is missing");
      return;
    }
    if(this.roleForm.value.member === "" || this.roleForm.value.member === null || this.roleForm.value.member === undefined){
      this.alertService.error("Please select member");
      return;
    }
    const saveData = this.roleForm.value;
    const params:any={};
    params['data']={
      name: saveData.roleName,
      memberId: saveData.member
    }
    this.loaderService.show();
    this.roleSaveSubscriber = this.apolloClient.setModule('addCommunityRole').mutateData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
        else{
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('/role/permission/'+response.data?.slug);
          // this.router.navigateByUrl('/role/permission/'+'usher');
        }
      },
      error: err =>{
        console.log(err);        
      }
    })
    this.loaderService.hide();
  }

  cancel(): void {
    this.router.navigateByUrl('/role');
  }

  searchRole(event:any){
    this._filter(event.target.value);
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    // console.log("filterValue====", filterValue);
    
    this.filteredOptions = this.options.filter((val:any) => val.members.user.name.toLowerCase().includes(filterValue));
    console.log(this.filteredOptions);
    
    if(this.filteredOptions.length == 0){
      return;
      // this.roleForm.value.member = "";
    }
  }

  // filter(): void {
  //   const filterValue = this.input.nativeElement.value.toLowerCase();
  //   console.log("filterValue=====", filterValue);
    
  //   this.filteredOptions = this.options.filter((option:any) => option.toLowerCase().includes(filterValue));
  // }

  // getActiveMembersList(){
  //   const params:any = {}; 
  //   params['data']={
  //     communityId: this.storageService.getLocalStorageItem('communtityId'),
  //     roles: ["member","fan"]
  //   }
  //   this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
  //     if(response.error) {
  //       this.alertService.error(response.message);
  //       return;
  //     } else {
  //         this.options = response.data.members;
  //         this.filteredOptions = response.data.members;
  //         // console.log("this.options======", this.options); 
  //       }
  //   });
  // }

  getMemberList(){
    this.loaderService.show();
    this.apolloClient.setModule('getUnAssignedMembers').queryData().subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.loaderService.hide();
        this.alertService.error(response.message);
        return;
      } else {
        this.loaderService.hide();
          this.options = response.data;
          this.filteredOptions = response.data;
        }
    });
  }

  saveAsssignMember(){
    this.roleForm.controls['member'].setValue(this.saveRole);
    if(this.roleForm.value.member === "" || this.roleForm.value.member === null || this.roleForm.value.member === undefined){
      this.alertService.error("Please select member");
      return;
    }
    const saveAssignData = this.roleForm.value;
    const params:any={};
    params['data']={
      memberId: saveAssignData.member,
      slug: this.slug
    }
    this.loaderService.show();
    this.roleSaveSubscriber = this.apolloClient.setModule('assignUsherRole').mutateData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
        }
        else{
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('/role');
        }
      },
      error: err =>{
        console.log(err);        
      }
    });
    this.loaderService.hide();
  }
}

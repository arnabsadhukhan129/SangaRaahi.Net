import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoginData } from 'src/app/shared/models/login-user.model';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonService } from '../../../services/common.service';
@Component({
  selector: 'app-login-list',
  templateUrl: './login-list.component.html',
  styleUrls: ['./login-list.component.css']
})
export class LoginListComponent implements OnInit,OnDestroy {
  private logSubscriber!: Subscription;
  getLogs: LoginData[] = [];
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  searchForm!: FormGroup;
  seachFilter: boolean = false;
  communityId!: string;

  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private commonService: CommonService
  ){
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
    this.commonService.sendSearch("no search");
  }
  ngOnInit(): void {
    this.getLoginUserDetails(this.current);
    this.generateSearchForm();
  }

  ngOnDestroy(): void {
    if(this.logSubscriber){
      this.logSubscriber.unsubscribe();
    }
  }

  /**Using for declare the search form */
  generateSearchForm(){
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }
  /**clear the search value*/
  clear(){
    this.searchForm.controls['search'].setValue('');
    this.getLoginUserDetails(this.current);
  }

  /**get the login user list*/
  getLoginUserDetails(page:number){
    const params:any = {}
    params['data'] = {
      communityId:this.communityId,
      page: page,
    }
    if(this.searchForm?.value.search && this.searchForm?.value.search!=''){
      params['data'].search = this.searchForm?.value.search.trim();
      params['data'].page = 1;
    }
    this.loaderService.show();
    this.logSubscriber = this.apolloClient.setModule('getLoggedInUsers').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.getLogs = response.data?.members;
          console.log(this.getLogs);
          
          this.totalData = response.data?.total;
          this.from = response.data?.from;
          this.to = response.data?.to;
          if(response.data.total !== 0) {
            this.totalPageNo = Math.ceil(response.data.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }
          
        }
      },
      error: err=>{
        console.log(err);
      }
    });  
    this.loaderService.hide();  
  }

  /**Using for search toggle */
  searchToggle(){
    if(!this.seachFilter){
      this.seachFilter = true;
      this.clear();
    }
    else{
      this.seachFilter = false;
    }
  }

  /**Using for current page */
  public onGoTo(page: number): void {
    this.current = page;
    this.getLoginUserDetails(this.current);
    }
  
    /**Using for move to next page */
    public onNext(page: number): void {
    this.current = page + 1;
    this.getLoginUserDetails(this.current);
    }
  
    /**Using for move to current page */
    public onPrevious(page: number): void {
    this.current = page - 1;
    this.getLoginUserDetails(this.current);
    }
}

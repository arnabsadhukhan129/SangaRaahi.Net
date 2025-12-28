import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { User } from '../typedefs/custom.types';
import { StorageService } from './storage.service';
import { LoaderService } from './loader.service';
import { ApolloClientService } from './apollo-client.service';
import { AlertService } from './alert.service';
import {Router} from "@angular/router";
import { GeneralResponse } from '../interfaces/general-response.ineterface';
import { Subscription } from 'rxjs';
import { DashboardComponent } from 'src/app/modules/dashboard/components/dashboard/dashboard.component';
import { CommonService } from 'src/app/modules/dashboard/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class CommunityService implements OnInit,OnDestroy {
  switchSubscriber!: Subscription;
  dashboardSubscription!: Subscription;
  creditSubscriber!: Subscription
  dashboardData: any;
  creditBalance!: any;

  constructor(
    private storage: StorageService,
    private loader: LoaderService,
    private apollo: ApolloClientService,
    private alertService: AlertService,
    private router: Router,
    private commonService: CommonService,
  ) { }


  ngOnInit(): void {
    
  }
  
  ngOnDestroy(): void {
    if(this.switchSubscriber){
      this.switchSubscriber.unsubscribe();
    }
    if(this.dashboardSubscription){
      this.dashboardSubscription.unsubscribe();
    }
    if(this.creditSubscriber){
      this.creditSubscriber.unsubscribe();
    }
  }

  switchCommunity(id:any){
    const data = {
      data: {
        id: id
      }
    };
    this.loader.show();
    this.switchSubscriber = this.apollo.setModule("switchOrganiztionPortal").mutateData(data)
      .subscribe((response:GeneralResponse) => {

        if(response.error) {
          // Sow toaster
          this.alertService.error(response.message);
        } else {
          this.setToken(id);
          this.alertService.success(response.message);
          this.getAllCommunitiesSmsEmailCredit();
          this.getmyCommunityDashboardList();
        }
      });
      this.loader.hide();
  }

  private setToken(token:string) {
    this.storage.setLocalStorageItem("communtityId", token);
  }

  getmyCommunityDashboardList(){
    const params:any = {}
      params['data'] = {
        id: this.storage.getLocalStorageItem('communtityId')
      }
    this.loader.show();
    this.dashboardSubscription = this.apollo.setModule('getmyCommunityDashboardList').queryData(params).subscribe((response: GeneralResponse) => {    
      this.loader.hide();
      if(response?.error) {
        this.alertService.error(response.message);
      } else {
        this.dashboardData = response;
        this.commonService.sendData(this.dashboardData);
        this.router.navigateByUrl('/dashboard');
      }
    });
  }

  getAllCommunitiesSmsEmailCredit(){
    const params={
      getCommunitiesSmsEmailCreditByIdId : this.storage.getLocalStorageItem('communtityId')
    }
    this.loader.show();
    this.creditSubscriber = this.apollo.setModule('getCommunitiesSmsEmailCreditById').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.creditBalance = response;
          this.commonService.sendCredit(this.creditBalance);
          
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loader.hide();
  }
}

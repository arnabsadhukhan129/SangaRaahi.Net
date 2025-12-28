import { Component, DoCheck, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, DoCheck {
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  getCheckInList: any;
  getCheckinDetails: any;
  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private commonService: CommonService
  ){}

  ngOnInit(): void {
    this.commonService.getUrl().subscribe((page:any)=>{
      if(page){
        this.current = page
      }
      else{
        this.current = 1;
      }
    })
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getCheckinDetails = saveRole?.checkin;
    this.getList(this.current);
  }

  ngDoCheck(): void {
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getCheckinDetails = saveRole?.checkin;
  }

  getList(page:number){
    const params:any = {};
    params['data'] = {
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      ongoing: true
    }
    this.loaderService.show();
    this.apolloClient.setModule('getMyCommunityEvents').queryData(params).subscribe((response: GeneralResponse) => {
      if(response.error) {
        this.alertService.error(response.message);
        return;
      } else {
          this.getCheckInList = response?.data?.events;
          //  console.log('-------------', this.getCheckInList);
          this.totalData = response?.data?.total;
          this.from = response?.data?.from;
          this.to = response?.data?.to;
          if(response?.data?.total !== 0) {
            this.totalPageNo = Math.ceil(response?.data?.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }     
        }
    });

    this.loaderService.hide();
  }

   /**Using for current page */
   onGoTo(page: number): void {
    this.current = page;
    this.getList(this.current);
    }
  
    /**Using for move to next page */
    onNext(page: number): void {
    this.current = page + 1;
    this.getList(this.current);
    }
  
    /**Using for move to current page */
    onPrevious(page: number): void {
    this.current = page - 1;
    this.getList(this.current);
    }
}

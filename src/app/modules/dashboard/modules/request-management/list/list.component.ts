import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import {requestMember} from 'src/app/shared/models/request-members.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit,OnDestroy {
  requestMemberSubscriber!: Subscription;
  approvalSubscriber!: Subscription;
  searchForm!: FormGroup;
  getRequestMembers: requestMember[] = [];
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  seachFilter: boolean = false;


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
    this.generateSearchForm();
    this.getMembers(this.current);
  }

  ngOnDestroy(): void {
    if(this.requestMemberSubscriber){
      this.requestMemberSubscriber.unsubscribe();
    }
    if(this.approvalSubscriber){
      this.approvalSubscriber.unsubscribe();
    }
  }

  /**Using for declare the search form */
  generateSearchForm(){
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  /**Using for get request members list */
  getMembers(page:number){
    const params:any = {};
    params['data'] = {
      page: page,
      communityId: this.storageService.getLocalStorageItem('communtityId'),
    }
    if(this.searchForm?.value.search && this.searchForm?.value.search!=''){
      params['data'].search = this.searchForm?.value.search.trim();
      params['data'].page = 1;
    }
    this.loaderService.show();
    this.requestMemberSubscriber = this.apolloClient.setModule('communityRequestList').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.alertService.error(response.message);
          return;
        }
        else{
          this.getRequestMembers = response?.data?.communities;
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

  /**Using for current page */
  onGoTo(page: number): void {
    this.current = page;
    this.getMembers(this.current);
    }
  
    /**Using for move to next page */
    onNext(page: number): void {
    this.current = page + 1;
    this.getMembers(this.current);
    }
  
    /**Using for move to current page */
    onPrevious(page: number): void {
    this.current = page - 1;
    this.getMembers(this.current);
    }

    /**Using for show search section */
    searchToggle(){
      if(!this.seachFilter){
        this.seachFilter = true;
      }
      else{
        this.seachFilter = false;
      }
    }

    /**Using for clear search data */
    clear(){
      this.searchForm.controls['search'].setValue('');
      this.getMembers(this.current);
    }

    //Using for member request accept or reject
    memberapproval(status:boolean,memberId:any){
      const params:any= {}
      params['data']={
        communityId: this.storageService.getLocalStorageItem('communtityId'),
        memberId: memberId
      }
      if(status === true){
        params['data'].approveStatus = true;
      }
      else if(status === false){ 
        params['data'].approveStatus = false;
      }
      this.loaderService.show();
      this.approvalSubscriber = this.apolloClient.setModule('approveOrRejectMemberRequest').mutateData(params).subscribe({
        next: (response: GeneralResponse)=> {
          if(response.error) {
            this.alertService.error(response.message);
            return;
          }
          else{
            this.alertService.success(response.message);
            // this.router.navigateByUrl('/active-members');
          }
          this.getMembers(this.current);
        },
        error: err=> {
          console.log(err);
        }
      });
      this.loaderService.hide();
    }
}

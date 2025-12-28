import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { blog } from 'src/app/shared/models/blog.model';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
declare var window:any;
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit,DoCheck,OnDestroy {
  private blogSubscriber!: Subscription;
  private blogsStatusSubscriber!: Subscription;
  private paymentStatusSubscriber!: Subscription;
  getBlogs: blog[] = [];
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  seachFilter: boolean = false;
  toggleFilter:boolean = false;
  $modal: any;
  $readModal: any;
  $readEventModal: any;
  event: any;
  index!: number;
  blogId!: string;
  getGroupName!:string;
  eventName!: string;
  sortName: boolean = false;
  sortDate: boolean = false;
  getBlogDetails: any;
  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private commonService: CommonService
  ){
    this.commonService.sendSearch("no search");
  }

  ngOnInit(): void {
    this.commonService.getUrl().subscribe((page:any)=>{
      if(page){
        this.current = page
      }
      else{
        this.current = 1;
      }
    });
    this.getAllBlogs(this.current);
    this.generateSearchForm();
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getBlogDetails = saveRole?.blog;
  }

  ngDoCheck(): void {
    let setRole = this.storageService.getLocalStorageItem('setRole');
    let saveRole = setRole ? JSON.parse(setRole) : null;
    this.getBlogDetails = saveRole?.blog;
  }

  ngOnDestroy(): void {
    if(this.blogSubscriber){
      this.blogSubscriber.unsubscribe();
    }
    if(this.blogsStatusSubscriber){
      this.blogsStatusSubscriber.unsubscribe();
    }
    if(this.paymentStatusSubscriber){
      this.paymentStatusSubscriber.unsubscribe();
    }
  }

  /**Using for declare the search form */
  generateSearchForm(){
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });

    this.filterForm = new FormGroup({
      blogCategory: new FormControl(''),
      sortByDate: new FormControl(''),
      sortByName: new FormControl('')
    });
  }

  /**Using for clear search data */
  clear(){
    this.searchForm.controls['search'].setValue('');
    this.getAllBlogs(this.current);
  }

  //Using for choose sort option
  sortData(event:any){
    if(event.target.value === 'name'){
      this.sortName = true;
      this.sortDate = false;
      this.filterForm.controls['sortByDate'].setValue('');
    }
    else if(event.target.value === 'date'){
      this.sortDate = true;
      this.sortName = false;
      this.filterForm.controls['sortByName'].setValue('');
    }
  }

  /**Using for get blog list */
  getAllBlogs(page:number){
    const params:any = {};
    params['data'] = {
      communityId: this.storageService.getLocalStorageItem('communtityId'),
      page: page,
    }

    if(this.searchForm?.value.search && this.searchForm?.value.search!=''){
      params['data'].search = this.searchForm?.value.search.trim();
      params['data'].page = 1;
    }

    if(this.filterForm?.value.blogCategory && this.filterForm?.value.blogCategory!=''){
      if(this.filterForm.value.blogCategory === "Public"){
        params['data'].blogCategory = "Public";
      }
      else if(this.filterForm.value.blogCategory === "Private"){
        params['data'].blogCategory = "Private";
      }
      else if(this.filterForm.value.blogCategory === "Fan"){
        params['data'].blogCategory = "Fan";
      }
    }

    if(this.filterForm?.value?.sortByDate && this.filterForm?.value?.sortByDate!=''){
      if(this.filterForm?.value?.sortByDate === 'descDate'){
        params['data'].columnName = "DateSort";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByDate === 'ascDate'){
        params['data'].columnName = "DateSort";
        params['data'].sort = "asc";
      }
    }

    if(this.filterForm?.value?.sortByName && this.filterForm?.value?.sortByName!=''){
      if(this.filterForm?.value?.sortByName === 'descName'){
        params['data'].columnName = "BlogName";
        params['data'].sort = "desc";
      }
      else if(this.filterForm.value.sortByName === 'ascName'){
        params['data'].columnName = "BlogName";
        params['data'].sort = "asc";
      }
     }

    this.loaderService.show();
    this.blogSubscriber = this.apolloClient.setModule('getAllBlogs').queryData(params).subscribe({
      next:(response: GeneralResponse)=>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.getBlogs = response.data?.blogs;
          this.totalData = response.data?.total;
          this.from = response.data?.from;
          this.to = response.data?.to;
          if(response.data.total !== 0) {
            this.totalPageNo = Math.ceil(response.data.total / this.limit);
          }else {
            this.totalPageNo = 0;
          }
          //console.log("getBlogs......",this.getBlogs);
        }
      },
      error: err=>{
        this.loaderService.hide();
        console.log(err);
      }
    });  
      
  }

  

   /**Using for current page */
    onGoTo(page: number): void {
    this.current = page;
    this.getAllBlogs(this.current);
    }
  
    /**Using for move to next page */
    onNext(page: number): void {
    this.current = page + 1;
    this.getAllBlogs(this.current);
    }
  
    /**Using for move to current page */
    onPrevious(page: number): void {
    this.current = page - 1;
    this.getAllBlogs(this.current);
    }

    /**Using for blog status change */
    toggleBlogStatus(event: any, index:number, blogId:any){
      const params:any={};
      params['data'] = {
        blogId: blogId
      };
      this.loaderService.show();
      this.blogsStatusSubscriber = this.apolloClient.setModule('blogStatusChange').mutateData(params).subscribe({
        next: (response: GeneralResponse)=> {
          if(response.error) {
            this.alertService.error(response.message);
            return;
          }
          else{
            if(this.getBlogs[index].blogStatus === true)
            {
               this.getBlogs[index].blogStatus = false;
            }
            else if(this.getBlogs[index].blogStatus === false)
            {
               this.getBlogs[index].blogStatus = true;
            }
            this.alertService.success(response.message);
          }
        },
        error: err=> {
          console.log(err);
        }
      });
      this.loaderService.hide();
    }

    togglePermanentStatus(event: any, index:number, blogId:any){
      this.$modal = new window.bootstrap.Modal(
        document.getElementById("alertStatus")
      );
      this.event = event;
      this.index = index;
      this.blogId = blogId;
      if(this.getBlogs[index].paymentStatus === false){
        this.$modal.show();
      }
      else if(this.getBlogs[index].paymentStatus === true){
        this.togglePaymentStatus(event,index,blogId)
      }
    }

    closeModal(){
      this.$modal.hide();
      this.getAllBlogs(this.current);
    }

    /**Using for payment status change */
    togglePaymentStatus(event: any, index:number, blogId:any){
      const params:any={};
      params['data'] = {
        blogId: blogId
      };
      this.loaderService.show();
      this.paymentStatusSubscriber = this.apolloClient.setModule('blogPaymentStatusChange').mutateData(params).subscribe({
        next: (response: GeneralResponse)=> {
          if(response.error) {
            this.alertService.error(response.message);
            return;
          }
          else{
            if(this.getBlogs[index].paymentStatus === true)
            {
               this.getBlogs[index].paymentStatus = false;
            }
            else if(this.getBlogs[index].paymentStatus === false)
            {
               this.getBlogs[index].paymentStatus = true;
               this.getBlogs[index].blogStatus = true;
            }
            this.alertService.success(response.message);
            this.getAllBlogs(this.current);
            this.$modal.hide();
          }
        },
        error: err=> {
          console.log(err);
        }
      });
      this.loaderService.hide();
    }

    searchToggle(){
      if(!this.seachFilter){
        this.toggleFilter = false;
        this.seachFilter = true;
        //this.clear();
      }
      else{
        this.seachFilter = false;
      }
    }
  
    /**Using toggle for filter */
    filterToggle(){
      if(!this.toggleFilter){
        this.toggleFilter = true;
        this.seachFilter = false;
        //this.clear();
      }
      else{
        this.toggleFilter = false;
      }
    }

    /** Using for blog delete */
    deleteBlog(blogId:any,index:any){
    Swal.fire({
      title: 'Are you sure you want to delete this blog?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.value){
        this.removeRow(blogId, index);
      }
    })
    }
  
    /**Using for remove row after delete */
    removeRow(blogId:any,index:any){
      const params:any= {};
      params['data'] = {
        blogId : blogId,
      }
      this.loaderService.show();
      this.apolloClient.setModule('deleteBlogs').mutateData(params).subscribe((response: any) => {
        this.loaderService.hide();
        if(response.error) {
          this.alertService.error(response.message);
        } 
        else {
          this.alertService.success(response.message);
          this.getBlogs.splice(index,1);
          if(this.getBlogs.length === 0){
            this.onPrevious(this.current);
          }
          else{
            this.getAllBlogs(this.current);
          }
        }
      });
    }

    /**Using for read more details */
    moreDetails(datails:any){
      this.$readModal = new window.bootstrap.Modal(
        document.getElementById("blogNameModal")
      );
      this.getGroupName = datails.blogTitle;
      this.$readModal.show();
    }

    /**Using for read more event details */
    moreDetails1(datails:any){
      this.$readEventModal = new window.bootstrap.Modal(
        document.getElementById("eventNameModal")
      );
      this.eventName = datails.eventName;
      this.$readEventModal.show();
    }

    /**Using for redirect blog edit page */
    editBlog(blogId: any){
      this.commonService.sendUrl(this.current);
      this.router.navigateByUrl(`blog/edit/${blogId}`);
    }
}

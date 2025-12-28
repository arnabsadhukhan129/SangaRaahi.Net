import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import Swal from 'sweetalert2';
declare var window:any;

@Component({
  selector: 'app-corn-list',
  templateUrl: './corn-list.component.html',
  styleUrls: ['./corn-list.component.css']
})
export class CornListComponent implements OnInit,OnDestroy {
  cronList: any;
  eventId!: any;
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  $readEventModal:any;
  eventName!: string;
  rsvpLabelMap: { [key: string]: string } = {
    Yesrsvp: 'For Yes',
    Norsvp: 'For No Reply',
    Not_Attending: 'For No',
    tentative: 'For Tentative',
    All: 'For All'
  };
  

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ){
    this.activatedRoute.paramMap.subscribe(params => {
      this.eventId = params.get('id');
    });
  }
  ngOnInit(): void {
    this.getList(this.current);
  }
  ngOnDestroy(): void {
    
  }

  getList(page: number){
    const params: any = {};
    params['data'] = {
      eventId: this.eventId,
      page: page,
    }
    this.apolloClient.setModule('getCornByEvent').queryData(params).subscribe(
        (response: GeneralResponse) => {
          if (response.error) {
            this.alertService.error(response.message);
          } else {
            this.cronList = response.data?.crons;
            // console.log("cronList=====",this.cronList); 
            this.totalData = response.data.total;
            this.from = response.data?.from;
            this.to = response.data?.to;
            if (response.data.total !== 0) {
              this.totalPageNo = Math.ceil(response.data.total / this.limit);
            } else {
              this.totalPageNo = 0;
            }
          }
        },
        (error) => {
          // Handle error case
          this.alertService.error('Failed to load events.');
          this.loaderService.hide();
        }
      );
  }


   /**Using for read more event details */
   moreDetails(datails:any){
    this.$readEventModal = new window.bootstrap.Modal(
      document.getElementById("eventNameModal")
    );
    this.eventName = datails.eventName;
    this.$readEventModal.show();
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

    /** Using for cron delete */
    deleteCron(cronId:any,index:any){
      Swal.fire({
        title: 'Are you sure you want to delete this cron?',
        text: '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if(result.value){
          this.removeRow(cronId, index);
        }
      })
    }
      
    /**Using for remove row after delete */
    removeRow(cronId:any,index:any){
      const params:any= {};
      params['data'] = {
        cronId : cronId,
      }
      this.loaderService.show();
      this.apolloClient.setModule('deleteEventCron').mutateData(params).subscribe((response: any) => {
        this.loaderService.hide();
        if(response.error) {
          this.alertService.error(response.message);
        } 
        else {
          this.alertService.success(response.message);
          this.cronList.splice(index,1);
          if(this.cronList.length === 0){
            this.onPrevious(this.current);
          }
          else{
            this.getList(this.current);
          }
        }
      });
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import {CsvService} from 'src/app/shared/services/csv.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-logs-view',
  templateUrl: './logs-view.component.html',
  styleUrls: ['./logs-view.component.css']
})
export class LogsViewComponent implements OnInit, OnDestroy {
  supplierId!: any;
  eventId!: any;
  logList: any;
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public csvService: CsvService,
  ){
    this.activatedRoute.paramMap.subscribe(params => {
      this.supplierId = params.get('id');
    });
    this.activatedRoute.paramMap.subscribe(params => {
      this.eventId = params.get('eventId');
    });
  }

  ngOnInit(): void {
    this.getList(this.current)
  }

  ngOnDestroy(): void {
    
  }

  getList(page: number){
      const params: any = {};
      params['data'] = {
        supplierId: this.supplierId,
        page: page,
      }
      this.apolloClient.setModule('getSupplierLogHistory').queryData(params).subscribe(
          (response: GeneralResponse) => {
            if (response.error) {
              this.alertService.error(response.message);
            } else {
              this.logList = response.data;
              console.log("logList=====",this.logList); 
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

    /**Using for current page */
    public onGoTo(page: number): void {
      this.current = page;
      this.getList(this.current);
    }
    
    /**Using for move to next page */
    public onNext(page: number): void {
      this.current = page + 1;
      this.getList(this.current);
    }
    
    /**Using for move to current page */
      public onPrevious(page: number): void {
      this.current = page - 1;
      this.getList(this.current);
    }

    changeStatus(logId:any,index:any, status:any){
      const params:any= {};
      params['data'] = {
        supplierId: this.supplierId,
        id: logId,
        isActive: !status
      };
      // if(status){
      //   params['data']['isActive'] = false;
      // }
      // else{
      //   params['data']['isActive'] = false;
      // }
  
      this.loaderService.show();
  
      this.apolloClient.setModule('adminQuantityStatusChange').mutateData(params).subscribe((response: any) => {
        this.loaderService.hide();
        if(response.error) {
          this.alertService.error(response.message);
        } else {
          this.logList[index].isActive = !this.logList[index].isActive;
          this.alertService.success(response.message);
        }
      });
    }

    /**get Logs data for export to csv */
    exportLogsView(){
      this.loaderService.show();
          this.csvService.getLogsReq(this.supplierId).subscribe(
            (response: HttpResponse<Blob>) => {
              this.loaderService.hide();
              const contentDispositionHeader = response.headers.get('Content-Disposition');
              if (contentDispositionHeader) {
                const filename = contentDispositionHeader.split(';')[1].trim().split('=')[1];
                const blobParts: BlobPart[] = [response.body!];
                const options: BlobPropertyBag = { type: response.body?.type };
                const blob = new Blob(blobParts, options);
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              } else {
                // Handle the case where Content-Disposition header is missing
                // For example, you can generate a default filename or provide an error message
                const defaultFilename = 'Supplier-Log-Records';
                const blob = new Blob([response.body!], { type: response.body?.type });
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = defaultFilename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                console.warn('Content-Disposition header is missing in the response. Using default filename.');
              }
            },
            (error) => {
              // Handle error if needed
              console.error('Error:', error);
              this.loaderService.hide();
            }
          );
    }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-deep-link',
  templateUrl: './deep-link.component.html',
  styleUrls: ['./deep-link.component.css']
})
export class DeepLinkComponent implements OnInit{
  eventId!: any;
  eventData!: any;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private router: Router,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
  ){
    this.activatedRoute.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      console.log("eventId.......",this.eventId);
      
    });
  }

  ngOnInit(): void {
    this.getUrl();
  }

  getUrl(){
    // const url = 'https://demoyourprojects.com:5066/api/deep-link/'+ this.eventId;
    const url = 'https://api.sangaraahi.net/api/deep-link/'+ this.eventId;
    // console.log("url.....",url);
    window.location.href = url;
  }

  // getEventDetail(){
  //   const params:any= {};
  //   params['getchildEventDetailsId'] = this.eventId;
  //   this.loaderService.show();
  //   this.apolloClient.setModule('getchildEventDetails').mutateData(params).subscribe((response: any) => {
  //     if(response.error) {
  //       this.alertService.error(response.message);
  //     } else {
  //       this.eventData = response.data;
  //       // console.log("eventData...............",this.eventData);
  //     }
  //     this.loaderService.hide();
  //   }, (error) => {
  //     // Handle error case and hide the loader
  //     this.alertService.error('Failed to load events.');
  //     this.loaderService.hide();
  //   });
  // }
}
 
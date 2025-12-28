import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
// import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from 'src/app/shared/models/events.model';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})

export class ViewEventComponent implements OnInit, OnChanges{

  @Input() eventId!: any;
  eventData!: any;
  paymentCategory!: string;
  packageRate!: number;
  currency!: string;

  constructor(
                private alertService: AlertService,
                private sharedService: SharedService,
                private loaderService: LoaderService,
                private apolloClient: ApolloClientService,
                private router: Router,
                private activatedRoute : ActivatedRoute,
                private storageService: StorageService,
            )
  {

  }

  ngOnInit() : void
  {
    
   // console.log('child : ',this.groupId);
    //console.log('child : ',this.groupId);
               
        if(this.eventId)
        {
           this.getEventDetail();
        }
        this.currency = this.storageService.getLocalStorageItem('currency')
  }

  ngOnChanges(changes: any) {   
    //console.log(changes);
    for (const propName in changes) {
      const chng = changes[propName];
      this.eventId = chng.currentValue; //JSON.stringify(chng.currentValue);
      // const prev = JSON.stringify(chng.previousValue);

      //console.log('ngOnChanges : ',this.groupId);
    }

    if(this.eventId)
    {
       this.getEventDetail();
    }
  }


  getEventDetail()
  {
    const params:any= {};
    // params['getMyCommunityEventByIdId'] = this.eventId;
     params['getchildEventDetailsId'] = this.eventId;
    this.loaderService.show();

    this.apolloClient.setModule('getchildEventDetails').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.eventData = response.data;
        // console.log(this.eventData);
        
        if(this.eventData.paymentStatus === 'Paid'){
          if(this.eventData.paymentCategory === 'per_head'){
            this.paymentCategory = "Per Head";
            this.packageRate = this.eventData.paymentPackages[0].packageRate ? this.eventData.paymentPackages[0].packageRate : 0 
          }
          else if(this.eventData.paymentCategory === 'package_wise'){
            this.paymentCategory = "Package Wise";
          }
          else{
            this.paymentCategory === "N/A"
          }
        }
        else if(this.eventData.paymentStatus === 'Free'){
          this.paymentCategory = "Free";
        }
        else{
          this.paymentCategory = "N/A"
        }
        // this.groupForm.patchValue({
        //   name: groupData.name ? groupData.name : '',
        //   description: groupData.description ? groupData.description : '',
        //   type: groupData.type ? groupData.type : ''
        // });

      }
    });

  }



}

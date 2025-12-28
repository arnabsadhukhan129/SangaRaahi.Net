import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
// import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from 'src/app/shared/models/events.model';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})

export class ViewAnnouncementComponent implements OnInit, OnChanges{

  @Input() announcementId!: any;
  eventData!: any;
  

  constructor(
                private alertService: AlertService,
                private sharedService: SharedService,
                private loaderService: LoaderService,
                private apolloClient: ApolloClientService,
                private router: Router,
                private activatedRoute : ActivatedRoute
            )
  {

  }

  ngOnInit() : void
  {
                   
        if(this.announcementId)
        {
           this.getAnnouncementDetail();
        }
  }

  ngOnChanges(changes: any) {   
    //console.log(changes);
    for (const propName in changes) {
      const chng = changes[propName];
      this.announcementId = chng.currentValue; 
    }

    if(this.announcementId)
    {
       this.getAnnouncementDetail();
    }
  }


  getAnnouncementDetail()
  {
    const params:any= {};
    params['getAnnouncementOrganizationByIdId'] = this.announcementId;

    this.loaderService.show();

    this.apolloClient.setModule('getAnnouncementOrganizationByID').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {

        this.eventData = response.data;

      }
    });

  }



}

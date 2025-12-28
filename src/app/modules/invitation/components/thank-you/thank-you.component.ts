import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { paramService } from 'src/app/shared/params/params';
import { communities } from 'src/app/shared/typedefs/custom.types';
import { StorageService } from 'src/app/shared/services/storage.service';
@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent implements OnInit {

  invitationDetail : any;
  communities!: Array<communities>;
  communityId!:any;
  communityName!:string;
  constructor(private activatedRoute:ActivatedRoute,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private router: Router,
    private paramService:paramService,
    private StorageService: StorageService,
    )

{

}

  ngOnInit(): void {
    
    this.paramService.currentInvitationDetail.subscribe(data => {
         this.invitationDetail = data;
         //console.log(this.invitationDetail);
    });

    // this.communitityList();

  }

  communitityList(){
    this.loaderService.show();
    this.apolloClient.setModule('switchOrganizationList').queryData().subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      //console.log("response........",response);
      this.communities = response.data;
      this.communities.filter((data)=>{
        data['id'] === this.StorageService.getLocalStorageItem('communtityId');
      })
      // this.communityName = this.communities[0].communityName ? this.communities[0].communityName : ''
      this.communityName = this.StorageService.getLocalStorageItem('communityName');
    });
    //console.log(this.communities[0].communityName);
    
  }



}

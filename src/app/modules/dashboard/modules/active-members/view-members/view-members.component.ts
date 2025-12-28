import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-view-members',
  templateUrl: './view-members.component.html',
  styleUrls: ['./view-members.component.css']
})
export class ViewMembersComponent implements OnInit, OnDestroy {
  userId: any;
  memberId: any;
  getMemberDetaisSubscriber!: Subscription;
  getMemberDetails!: any;

  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ){
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.userId = params.get('id');
        this.memberId = params.get('memberId');
      },
      error: err => {}
    });
  }

  ngOnInit(): void {
    this.getFamilyMemberDetails();
  }

  ngOnDestroy(): void {
    if(this.getMemberDetaisSubscriber){
      this.getMemberDetaisSubscriber.unsubscribe();
    }
  }

  /**Get Family member Details....... */
  getFamilyMemberDetails(){
    const params = {
      data:{
        userId: this.userId,
        familyMemberId: this.memberId,
      }
    }
    this.loaderService.show();
    this.getMemberDetaisSubscriber = this.apolloClient.setModule('getFamilyMemberDetails').queryData(params).subscribe({
      next: (response:GeneralResponse) =>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.getMemberDetails = response.data;
          console.log("blogDetails......",this.getMemberDetails);
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loaderService.hide();
  }
}

import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ActiveMemberList } from 'src/app/shared/typedefs/custom.types';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { paramService } from 'src/app/shared/params/params';
import { CommonService } from '../../../services/common.service';
import {Location} from '@angular/common';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit,OnDestroy{
  comName!: string;
  communityId!: string;
  groupList: any;
  groupSearchData: any;
  announcementSearchData: any;  
  eventSearchData: any;
  feedbackSearchData: any;
  memberSearchData: any;
  seachFilter!: string;
  previousUrl!: string;
  currentUrl!: string;
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private datePipe: DatePipe,
    private paramService: paramService,
    private commonService: CommonService,
    private _location: Location
  ){
    
  }
  ngOnInit(): void {
    this.globalSearch();
    this.communityId = this.storageService.getLocalStorageItem('communtityId');
    this.comName = this.storageService.getLocalStorageItem('communityName');
  }

  ngOnDestroy(): void {
    // this.commonService.sendValue("");
  }
  // ngOnDestroy(): void {
  //   this.globalSearch();
  // }

  back(){
    //this.commonService.send();
    this._location.back();
    //for back to previous page....
    this.router.events.pipe(
      filter((event:any) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        this.paramService.updatecurrentRoute(this.currentUrl);
        this.commonService.sendSearch("no search");
        //console.log("currentUrl.....",this.currentUrl);
      })
      
  }

  globalSearch(){
    this.loaderService.show();
    this.commonService.getData().subscribe((e:any)=>{
      this.groupSearchData = e?.groups?.groupList;
      this.announcementSearchData = e?.announcements;
      this.eventSearchData = e?.events;
      this.feedbackSearchData = e?.communityfeedbacks;
      this.memberSearchData = e?.members;
    })
    this.loaderService.hide();
  }
}

import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'src/app/shared/services/storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../services/common.service';
import {Location} from '@angular/common';
declare var window:any;
import Swal from 'sweetalert2';
import { filter, takeLast } from 'rxjs';
//import {TooltipPosition} from '@angular/material/tooltip';

declare var window:any;

@Component({
  selector: 'app-webpage',
  templateUrl: './webpage.component.html',
  styleUrls: ['./webpage.component.css']
})

export class WebpageComponent implements OnInit, AfterViewInit {
  homeActiveTab: boolean = false;
  announcementActiveTab: boolean = false;
  videoActiveTab: boolean = false;
  paymentActiveTab: boolean = false;
  aboutActiveTab: boolean = false;
  comName!: string;
  $modal: any;
  value!: boolean;
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private commonService: CommonService,
    private _location: Location
  ){}
  ngOnInit(): void {
    this.showHome();
    this.comName = this.storageService.getLocalStorageItem('communityName');
    // this.commonService.getBooleanValue().subscribe((val)=>{
    //   if(val === true){
    //     this.value = val;
    //     this.$modal = new window.bootstrap.Modal(
    //       document.getElementById("saveModalData")
    //     );
    //     this.$modal.show();
    //   }
    //  })
  }

  ngAfterViewInit(): void {
    // this.commonService.getBooleanValue().subscribe((val)=>{
    //   if(val === true){
    //     this.$modal = new window.bootstrap.Modal(
    //       document.getElementById("saveModalData")
    //     );
    //     this.$modal.show();
    //   }
    //  })
  }
 // positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  /* -- Owl carousel -- script -- start --*/
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    //dots: true,
    navSpeed: 700,
    margin:30,
    //stagePadding: 50,
    //navText: ['P', 'N'],
    navText: [
      '<img class="edit_webPageTopTab_icon" src="assets/images/carousel-arrow-left-btn.png">',
      '<img class="edit_webPageTopTab_icon" src="assets/images/carousel-arrow-right-btn.png">'
    ],
    dots: false, // if you don't want dots, change to false

    responsive: {
      0: {
        items: 1
      },
      568: {
        items: 1
      },
      991: {
        items: 2
      },
      1024: {
        items: 3
      }
    },
    nav: true
  }
  /* -- Owl carousel -- script -- end --*/

  /* -- modal test -- */
  /*
  $modal: any;
  openModal()
  {
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("test")
    );
    this.$modal.show();
  }
  */
  showHome() {
    this.homeActiveTab = true;
    this.announcementActiveTab = false;
    this.videoActiveTab = false;
    this.paymentActiveTab = false;
    this.aboutActiveTab = false;
    this.router.navigateByUrl('community-management/edit-webpage/home');
  }

  showAnnouncement() {
    this.homeActiveTab = false;
    this.announcementActiveTab = true;
    this.videoActiveTab = false;
    this.paymentActiveTab = false;
    this.aboutActiveTab = false;
    this.router.navigateByUrl('community-management/edit-webpage/announcement');
  }
  
  showVideo() {
    this.homeActiveTab = false;
    this.announcementActiveTab = false;
    this.videoActiveTab = true;
    this.paymentActiveTab = false;
    this.aboutActiveTab = false;
    this.router.navigateByUrl('community-management/edit-webpage/video');
  }
  
  showPayment() {
    this.homeActiveTab = false;
    this.announcementActiveTab = false;
    this.videoActiveTab = false;
    this.paymentActiveTab = true;
    this.aboutActiveTab = false;
    this.router.navigateByUrl('community-management/edit-webpage/payment-details');
  }
  
  showAbout() {
    this.homeActiveTab = false;
    this.announcementActiveTab = false;
    this.videoActiveTab = false;
    this.paymentActiveTab = false;
    this.aboutActiveTab = true;
    this.router.navigateByUrl('community-management/edit-webpage/about-us');
  }

  back(){
    this.router.navigateByUrl("community-management/profile-edit");
  }

  notSave(){
    //this.$modal.hide();
  }

  // getData(event:boolean){
  //   console.log("event.......",event);
  //   this.value = event;
  //   if(event === true){
  //     this.value = true;
  //   }
  //   else{
  //     this.value = false;
  //   }
  // }
}

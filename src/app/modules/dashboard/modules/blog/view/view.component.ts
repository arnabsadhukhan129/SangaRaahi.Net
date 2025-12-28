import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import Swal from 'sweetalert2';
declare var window:any;
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit,OnDestroy {
  blogIdSubscriber!: Subscription;
  getBlogsSubscriber!: Subscription;
  blogId: any;
  blogDetails: any;
  $modal1: any;
  getImage!: string
  pdfFile:any = [];
  getBlogId: any;
  pdfViewerOpen = false;
  pdfViewerUrl = '';


  constructor(
    private formBuilder : FormBuilder,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private validator: ValidatorService,
  ){}
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.blogId = params.get('id');
      },
      error: err => {}
    });
    this.activatedRoute.paramMap.subscribe({
      next: params => {
        this.getBlogId = params.get('blogId');
      },
      error: err => {}
    });
    this.getBlogDetails();
  }
  ngOnDestroy(): void {
    if(this.blogIdSubscriber){
      this.blogIdSubscriber.unsubscribe();
    }
    if(this.getBlogsSubscriber){
      this.getBlogsSubscriber.unsubscribe();
    }
  }

  /**Using get blog details by id */
  getBlogDetails(){
    const params:any = {};
    params['data'] = {
      blogId: this.blogId
    }
    this.loaderService.show();
    this.getBlogsSubscriber = this.apolloClient.setModule('getBolgsById').queryData(params).subscribe({
      next: (response:GeneralResponse) =>{
        if(response.error){
          this.loaderService.hide();
          this.alertService.error(response.message);
          return;
        }
        else{
          this.loaderService.hide();
          this.blogDetails = response.data;
          if(this.blogDetails.pdf.length > 0){
            this.blogDetails.pdfFile = this.blogDetails.pdf.map((item:any)=>{
            const startIndex = item.lastIndexOf('/') + 1; // Find the index of the last '/'
            const endIndex = item.indexOf('%20', startIndex); // Find the index of the first '%20' after the last '/'
            const filename = item.substring(startIndex, endIndex !== -1 ? endIndex : undefined);
              return{
                    url: item,
                    name: filename,
              }
            })
          }
          // console.log("blogDetails......",this.blogDetails);
        }
      },
      error: err=>{
        console.log(err);
      }
    })
    this.loaderService.hide();
  }

  /**Using for show image */
  showImage(img:string){
    this.getImage = img;
    this.$modal1 = new window.bootstrap.Modal(
      document.getElementById("viewImage")
    );
    this.$modal1.show();
  }

  /**Using for close image modal */
  closeModal(){
    this.$modal1.hide()
  }

  /**Using For download pdf file */
  downloadFile(pdf:any,fileName:any){
    FileSaver.saveAs(pdf,fileName+'.pdf');
  }


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
        items: 2
      },
      991: {
        items: 3
      },
      1024: {
        items: 4
      }
    },
    nav: true
  }
  /* -- Owl carousel -- script -- end --*/

}

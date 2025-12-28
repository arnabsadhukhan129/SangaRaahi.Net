import { Component } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

declare var window:any;
@Component({
  selector: 'app-sample-page-two',
  templateUrl: './sample-page-two.component.html',
  styleUrls: ['./sample-page-two.component.css']
})
export class SamplePageTwoComponent {

  /* -- test modal --*/
  $modal: any;

  openModal()
  {
    this.$modal = new window.bootstrap.Modal(
      document.getElementById("test")
    );
    this.$modal.show();
  }
  /* -- test modal --*/

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

    center: false,
    nav: true,


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

  }
  /* -- Owl carousel -- script -- end --*/



}



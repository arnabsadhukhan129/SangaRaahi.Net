import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import {Location} from '@angular/common';
@Component({
  selector: 'app-mail-tab',
  templateUrl: './mail-tab.component.html',
  styleUrls: ['./mail-tab.component.css']
})
export class MailTabComponent implements OnInit {
  templateList: boolean = false;
  mailTemplate: boolean = false;
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
  ){
  }
  ngOnInit(): void {
    this.showMailList();
  }

  showMailList(){
    this.templateList = true;
    this.mailTemplate = false;
    this.router.navigateByUrl('email-template/mail-list');
  }
  showMailTempalte(){
    this.mailTemplate = true;
    this.templateList = false;
    this.router.navigateByUrl('email-template/template-list');
  }
}

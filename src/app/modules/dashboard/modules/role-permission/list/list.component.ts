import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CommonService } from '../../../services/common.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
declare var window:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  current: number = 1;
  limit: number = 10;
  totalPageNo!: number;
  totalData!:number;
  from!: number;
  to!: number;
  currentRole!: string;
  getRoleList: any;
  getUsherLists: any;
  role = {
    name:[
      "Board Member",
      "Executive Member",
      "Member",
      "Fan"
    ]
  }
  $modal: any;
  constructor(
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private storageService: StorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService
    
  ){

  }
  ngOnInit(): void {
    this.currentRole = this.storageService.getLocalStorageItem('role');
    this.getList(this.current);
  }

  redirectPermission(roleId:number){
    const id = roleId+1;
    this.router.navigateByUrl('/role/permission/'+id);
  }

   /**Using for current page */
   onGoTo(page: number): void {
    this.current = page;
    this.getList(this.current);
    }
  
    /**Using for move to next page */
    onNext(page: number): void {
    this.current = page + 1;
    this.getList(this.current);
    }
  
    /**Using for move to current page */
    onPrevious(page: number): void {
    this.current = page - 1;
    this.getList(this.current);
    }

    redirectPermissionForNewRole(slug:any){
      this.router.navigateByUrl('/role/permission/'+slug);
    }

    getList(page:number){
      const params:any = {};
      params['data'] = {
        page: page
      }
      this.loaderService.show();
      this.apolloClient.setModule('getCommunityCreatedRoles').queryData(params).subscribe((response: GeneralResponse) => {
        // console.log("data=====",response?.data);
        if(response.error) {
          this.alertService.error(response.message);
          return;
        } else {
            this.getRoleList = response?.data?.roles;
            //  console.log('-------------', this.getRoleList?.length);
            this.totalData = response?.data?.total;
            this.from = response?.data?.from;
            this.to = response?.data?.to;
            if(response?.data?.total !== 0) {
              this.totalPageNo = Math.ceil(response?.data?.total / this.limit);
            }else {
              this.totalPageNo = 0;
            }     
          }
      });  
      this.loaderService.hide();
    }

    redirectAssignMember(slug:any){
      this.router.navigateByUrl('/role/add-role/'+this.getRoleList[0]?.name+'/'+slug)
    }

    getUsherList(slug:any){
      const params:any = {};
      params['data'] = {
        slug: slug
      }
      this.loaderService.show();
      this.apolloClient.setModule('getUsherAssignedMembers').queryData(params).subscribe((response: GeneralResponse) => {
        if(response.error) {
          this.alertService.error(response.message);
          return;
        } else {
            this.getUsherLists = response?.data;
            // console.log("=====",this.getUsherLists);
            this.$modal = new window.bootstrap.Modal(
              document.getElementById("usharListModal")
            );
            this.$modal.show();
        }
      });  
      this.loaderService.hide();
    }


}

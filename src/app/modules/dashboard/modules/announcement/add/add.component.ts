import { Component } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ValidatorFn, AbstractControl, FormGroup, FormArray, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';
import { CountryCodes } from 'src/app/shared/typedefs/custom.types';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})

export class CreateAnnouncementComponent {

  announcementForm!: FormGroup;
  announcementId!: any;
  todayDate = new Date();
  //todayDate = new Date(Date.now() + ( 3600 * 1000 * 24));

  constructor(
    private alertService: AlertService,
    private sharedService: SharedService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private router: Router,
    private activatedRoute : ActivatedRoute,
    private formBuilder: FormBuilder,
    private validator: ValidatorService
)
{

}

ngOnInit() : void
  {
        this.activatedRoute.paramMap.subscribe(params => {
          this.announcementId = params.get('id');
        });

        this.generateForm();

        if(this.announcementId)
        {
           this.getAnnouncementDetails();
        }
  }

  generateForm()
  {
       
        this.announcementForm = new FormGroup({
          title : new FormControl('', [Validators.required, this.validator.nameIsLong]),
          description : new FormControl('', [Validators.required]),
          endDate : new FormControl('', [Validators.required]),
          type : new FormControl('', [Validators.required]),          
        
      });
  }

  getAnnouncementDetails()
  {
    const params:any= {};
    params['getAnnouncementOrganizationByIdId'] = this.announcementId;
    let groupData : any = {};

    this.loaderService.show();

    this.apolloClient.setModule('getAnnouncementOrganizationByID').mutateData(params).subscribe((response: any) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {

          groupData = response.data;
        
        //console.log('groupData', groupData);

            let endDate = this.sharedService.getDateFormat(groupData.endDate);
        

          //console.log('---------',endDate);

        this.announcementForm.patchValue({
          title : groupData.title ? groupData.title : '',
          description : groupData.description ? groupData.description : '',
          type : groupData.toWhom ? groupData.toWhom : '',
          //endDate : groupData.endDate ? new Date(groupData.endDate) : '',
          endDate : endDate
        });

       
      }
    });

  }


  

saveData()
{
  
  //console.log(this.announcementForm.value);


  const params: any = {};
  

      if(this.announcementId)
      {
        params['updateMyCommunityAnnouncementId'] = this.announcementId;
        params['data'] = {
          toWhom: this.announcementForm.value.type,
          title: this.announcementForm.value.title,
          endDate: this.announcementForm.value.endDate,
          description: this.announcementForm.value.description
        }

        //console.log(params['data']);

          this.loaderService.show();
              this.apolloClient.setModule("updateMyCommunityAnnouncement").mutateData(params).subscribe((response: any) => {
                if (response.error) {
                  this.loaderService.hide();
                  this.alertService.error(response.message)
                }
                else {
                  this.loaderService.hide();
                  this.alertService.error(response.message);
                  this.router.navigateByUrl('/announcements');
                  
                }
              });
      }
     else
      {

            params['data'] = {
              type: this.announcementForm.value.type,
              title: this.announcementForm.value.title,
              endDate: this.announcementForm.value.endDate,
              description: this.announcementForm.value.description
            }

            this.loaderService.show();
            this.apolloClient.setModule("createAnnouncementOrganization").mutateData(params).subscribe((response: any) => {
              if (response.error) {
                this.loaderService.hide();
                this.alertService.error(response.message)
              }
              else {
                this.loaderService.hide();
                this.alertService.error(response.message);
                this.router.navigateByUrl('/announcements');
                
              }
            });
      }
  
  
}


  cancel(){
    this.router.navigateByUrl('announcements')
  }


}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { GraphQLModule, MaterialModule } from './modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ApolloClientService } from './services/apollo-client.service';
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { CommunityService } from './services/community.service';
import { PaginationComponent } from './components/pagination/pagination.component';
import { CommunityModalComponent } from './components/community-modal/community-modal.component';
// import {IvyCarouselModule} from 'angular-responsive-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { TruncatePipe } from './custom-pipe/truncate.pipe';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SafePipe } from './custom-pipe/safe.pipe';
import {SharedService} from './services/shared.service';
import { CKEditorModule } from 'ckeditor4-angular';
import { NotificationService } from './services/notification.service';
import { FirstnamePipe } from './custom-pipe/firstname.pipe';
import { CustomTimeFormatPipePipe } from './custom-pipe/custom-time-format-pipe.pipe';
import { MultiDropDownComponent } from './components/multi-drop-down/multi-drop-down.component';
import { CapitalizePipe } from './custom-pipe/capitalize.pipe';
import { TitleCasePipe } from './custom-pipe/title-case.pipe';
import { JsonToHtmlPipe } from './custom-pipe/json-to-html.pipe';
import { RemoveUnderscorePipe } from './custom-pipe/remove-underscore.pipe';
import { StatusColorPipe } from './custom-pipe/status-color.pipe';
import { SafeHtmlPipe } from './custom-pipe/safe-html.pipe';
import { NgChartsModule } from 'ng2-charts';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    LoaderComponent,
    PaginationComponent,
    CommunityModalComponent,
    TruncatePipe,
    SafePipe,
    FirstnamePipe,
    CustomTimeFormatPipePipe,
    MultiDropDownComponent,
    CapitalizePipe,
    TitleCasePipe,
    JsonToHtmlPipe,
    RemoveUnderscorePipe,
    StatusColorPipe,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    GraphQLModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    // IvyCarouselModule,
    CarouselModule,
    ImageCropperModule,
    CKEditorModule,
    NgChartsModule,
    NgSelectModule
    



  ],
  exports:[
    GraphQLModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    LoaderComponent,
    PaginationComponent,
    // IvyCarouselModule,
    CarouselModule,
    TruncatePipe,
    SafePipe,
    ImageCropperModule,
    CKEditorModule,
    FirstnamePipe,
    CustomTimeFormatPipePipe,
    CapitalizePipe,
    TitleCasePipe,
    JsonToHtmlPipe,
    RemoveUnderscorePipe,
    StatusColorPipe,
    SafeHtmlPipe,
    NgChartsModule,
    NgSelectModule,

  ],
  providers:[
    ApolloClientService,
    AlertService,
    AuthService,
    StorageService,
    CommunityService,
    DatePipe,
    SharedService,
    NotificationService
  ]
})
export class SharedModule {
  static forRoot() {
    return {
      ngModule: SharedModule,
      providers: []
    }
  }
}

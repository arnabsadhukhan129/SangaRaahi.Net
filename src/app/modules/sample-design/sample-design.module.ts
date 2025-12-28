import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SampleDesignRoutingModule } from './sample-design-routing.module';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { SamplePageTwoComponent } from './components/sample-page-two/sample-page-two.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProfileEditComponent,
    SamplePageTwoComponent
  ],
  imports: [
    CommonModule,
    SampleDesignRoutingModule,
    SharedModule
  ],
  exports: [
    SharedModule
  ]
})
export class SampleDesignModule {

}

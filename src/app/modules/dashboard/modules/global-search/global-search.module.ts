import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalSearchRoutingModule } from './global-search-routing.module';
import { SearchComponent } from './search/search.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GlobalSearchRoutingModule
  ]
})
export class GlobalSearchModule { }

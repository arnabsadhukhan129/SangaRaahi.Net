import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MatTreeModule} from '@angular/material/tree';
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from "@angular/material/dialog";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSortModule} from '@angular/material/sort';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatChipsModule} from '@angular/material/chips';


// Add more material module here
const materialmodule:any = [
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatSidenavModule,
  MatCardModule,
  MatDividerModule,
  MatMenuModule,
  MatListModule,
  MatInputModule,
  MatFormFieldModule,
  MatGridListModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatTableModule,
  MatTabsModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatPaginatorModule,
  MatRadioModule,
  MatTreeModule,
  MatDialogModule,
  MatAutocompleteModule,
  MatSortModule,
  MatSlideToggleModule,
  MatChipsModule,
  
];

@NgModule({
  declarations: [],
  imports: [materialmodule],
  exports: [materialmodule],
  providers:[
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000}},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class MaterialModule { }

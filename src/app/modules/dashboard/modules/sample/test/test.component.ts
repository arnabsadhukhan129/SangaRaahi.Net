import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { GeneralResponse } from 'src/app/shared/interfaces/general-response.ineterface';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @ViewChild('memberInput') memberInput!: ElementRef<HTMLInputElement>;
  eparatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl('');
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);



  members: any = [];
  memberCtrl= new FormControl('');
  getMemberData: any = [];
  memberDataArray:any = [];
  separatorKeysCodes1: number[] = [ENTER, COMMA];

  constructor(
    private storageService: StorageService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
  ){
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );

  }
  ngOnInit(): void {
    this.getMemberList();
  }

  // Add for members...........start
  addMember(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our member
    if (value) {
      this.members.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();

    this.memberCtrl.setValue(null);
  }

  getMemberList(){
    const params= {
      data:{
        communityId: this.storageService.getLocalStorageItem('communtityId'),
      }
    }
    this.loaderService.show();
    this.apolloClient.setModule('communityActivePassiveMemberList').queryData(params).subscribe((response: GeneralResponse) => {
      this.loaderService.hide();
      if(response.error) {
        this.alertService.error(response.message);
      } else {
        this.getMemberData = response.data?.members;
        this.getMemberData.forEach((element:any,index:number) => {
          element.isMemberDisabled = false;
        });
      }
    });
  }

  removeMember(group: string): void {
    const index = this.members.indexOf(group);
    if (index >= 0) {
      this.members.splice(index, 1);
      this.memberDataArray.splice(index,1);
      this.announcer.announce(`Removed ${group}`);
    }
  }

  selectedMember(event: MatAutocompleteSelectedEvent): void {
    this.memberDataArray.push(event.option.value);
    this.members.push(event.option.viewValue);
    this.memberInput.nativeElement.value = '';
    this.memberCtrl.setValue(null);
  }


  cancelMember(memberData:any){
    const memberdata1 = memberData.split('(')[1];
    const memberdata2 = memberdata1.split(')')[0];
    this.getMemberData.map((value:any,index:number)=>{
      if(value?.members?.user?.id === memberdata2){
        this.getMemberData[index].isMemberDisabled = false;
      }
    })
  }

  isMemberOptionDisabled(index:number){
    this.getMemberData[index].isMemberDisabled = true;
  }


  // Add the trackMember function
  trackMember(index: number, member: any): any {
    return member; // or provide a unique identifier for tracking
  }

  // Add for members...........end
















  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

    // Add the trackFruit function
    trackFruit(index: number, fruit: any): any {
      return fruit; // or provide a unique identifier for tracking
    }
}

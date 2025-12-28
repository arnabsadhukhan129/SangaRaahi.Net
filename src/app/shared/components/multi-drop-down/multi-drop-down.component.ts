import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from './multi-dropdown.model';

@Component({
  selector: 'app-multi-drop-down',
  templateUrl: './multi-drop-down.component.html',
  styleUrls: ['./multi-drop-down.component.css']
})
export class MultiDropDownComponent {
  _items: Item[] = [];
  private searchText = '';
  @Input() placeholder!: string;
  @Input() showSearch = true;
  @Input() showAll = true;
  @Input() showStatus = true;
  @Input() showError = false;
  @Input() uid = Date.now();
  @Output() itemChange = new EventEmitter<Item>();

  @Input('items')
  set items(items: Item[]) {
    this._items = items;
    this._items.map((item) => {
      item.checked = item.checked || false;
      item.visible = item.visible || true;
    });
    this.filtered = [...this._items];

    if (!this.filtered.length) {
      this.all.visible = false;
    } else {
      this.all.visible = true;
    }
  }

  filtered: Item[] = [];
  all: Item = structuredClone<Item>({
    id: `all-${Date.now()}`,
    name: 'All',
    checked: false,
    visible: true,
  });
  get search(): string {
    return this.searchText;
  }

  set search(searchText: string) {
    this.searchText = searchText;

    const search = this.searchText.toLowerCase();
    if (!search) {
      this.filtered = [...this._items];
      this.all.visible = true;
      return;
    }
    this.filtered = this._items.filter(
      (i) => i.name.toLowerCase().indexOf(search) !== -1
    );
    if (this.all.name.toLowerCase().indexOf(search) !== -1) {
      this.all.visible = true;
    } else {
      this.all.visible = false;
    }
  }

  get selected(): string {
    return this.all && this.all.checked
      ? this.all.name
      : this._items
          .filter((i) => i.checked && i.visible)
          .map((i) => i.name)
          .join(', ');
  }

  get isEmpty(): boolean {
    return this.filtered.filter((i) => i.visible).length === 0;
  }

  get checked(): number {
    return this._items.filter((i) => i.checked).length;
  }

  trackByUuid(index: number, item: Item) {
    return item ? item.id + this.uid : undefined;
  }

  onChange($event: any, item: Item): void {
    // console.log("Hello:- ", $event);
    // console.log(this.itemChange, "ITEM CHANGE");

    const checked = $event.target.checked;
    const index = this._items.findIndex((i) => i.id === item.id);
    // console.log(item, "ITEM");

    if (item.id && item.id.includes('all-')) {
      this.all.checked = checked;
      for (const iterator of this._items) {
        iterator.checked = checked;
      }
    } else {
      this._items[index].checked = checked;

      if (this.all) {
        if (this.all.checked) {
          this.all.checked = false;
        }
        const allChecked = this._items
          .filter((i) => i.id !== null)
          .every((i) => i.checked);
        this.all.checked = allChecked;
      }
    }
    // if(item.id && item.id.includes('all-')){
      // this.itemChange.emit(item);
    // } else {
      this.itemChange.emit(item);
    // }

  }
}

export interface Item {
    id: string;
    name: string;
    checked?: boolean;
    visible?: boolean;
    icon?: string;
  }
  //import { ApiResponse } from '../../models/api-response';
  
  export interface Items{
    data: Array<Item>
  }
  
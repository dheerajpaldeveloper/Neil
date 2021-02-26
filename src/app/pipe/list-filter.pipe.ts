import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'ListFilter'
})
  
  export class ListFilterPipe implements PipeTransform {
    transform(list: Array<Object>, key:any, query?: any): any {
  
        if(!list)return null;
        if(!key) return null;
        if(!query)return list;
  
        query = query.toLowerCase();
  
        return list.filter((item) => {
            return item[key].toLowerCase().includes(query);
        });
    }
  }
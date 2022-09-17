import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataSearch',
  pure: false
})
export class DataSearchPipe implements PipeTransform {

  transform(items: string[], filter: string): any[] {

    if(!items || !filter)
    {
      return items;
    }

    let filteredList = Array<string>();
    if (items.length > 0) {
      filter = filter.toLowerCase();
      items.forEach(item => {
        //Object.values(item) => gives the list of all the property values of the 'item' object
        let propValueList = Object.values(item);
        for(let i=0;i<propValueList.length;i++)
        {
          if (propValueList[i]) {
            if (propValueList[i].toString().toLowerCase().indexOf(filter) > -1)
            {
              filteredList.push(item);
              break;
            }
          }
        }
      });
    }
    return filteredList;
    
  }

}

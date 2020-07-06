import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'generate'
})
export class GeneratePipe implements PipeTransform {

  transform(value:number): Array<number> {
    if(value===0){
      return [];
    }
    return new Array(value).fill(1);
  }

}

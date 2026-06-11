import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'countByStatus' })
export class CountByStatusPipe implements PipeTransform {
  transform(orders: any[], status: string): number {
    if (!orders) return 0;
    return orders.filter(o => o.status === status).length;
  }
}

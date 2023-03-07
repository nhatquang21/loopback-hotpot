import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {OrderDishes, OrderDishesRelations} from '../models';

export class OrderDishesRepository extends DefaultCrudRepository<
  OrderDishes,
  typeof OrderDishes.prototype.id,
  OrderDishesRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(OrderDishes, dataSource);
  }
}

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Dish, DishRelations} from '../models';

export class DishRepository extends DefaultCrudRepository<
  Dish,
  typeof Dish.prototype.id,
  DishRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Dish, dataSource);
  }
}

import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Order, OrderRelations, Dish, OrderDishes} from '../models';
import {OrderDishesRepository} from './order-dishes.repository';
import {DishRepository} from './dish.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly dishes: HasManyThroughRepositoryFactory<Dish, typeof Dish.prototype.id,
          OrderDishes,
          typeof Order.prototype.id
        >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('OrderDishesRepository') protected orderDishesRepositoryGetter: Getter<OrderDishesRepository>, @repository.getter('DishRepository') protected dishRepositoryGetter: Getter<DishRepository>,
  ) {
    super(Order, dataSource);
    this.dishes = this.createHasManyThroughRepositoryFactoryFor('dishes', dishRepositoryGetter, orderDishesRepositoryGetter,);
    this.registerInclusionResolver('dishes', this.dishes.inclusionResolver);
  }
}

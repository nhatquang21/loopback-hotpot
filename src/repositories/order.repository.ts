import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Dish, Order, OrderDishes, OrderRelations} from '../models';
import {CustomerRepository} from './customer.repository';
import {DishRepository} from './dish.repository';
import {OrderDishesRepository} from './order-dishes.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly dishes: HasManyThroughRepositoryFactory<
    Dish,
    typeof Dish.prototype.id,
    OrderDishes,
    typeof Order.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('OrderDishesRepository')
    protected orderDishesRepositoryGetter: Getter<OrderDishesRepository>,
    @repository.getter('DishRepository')
    protected dishRepositoryGetter: Getter<DishRepository>,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Order, dataSource);

    this.dishes = this.createHasManyThroughRepositoryFactoryFor(
      'dishes',
      dishRepositoryGetter,
      orderDishesRepositoryGetter,
    );
    this.registerInclusionResolver('dishes', this.dishes.inclusionResolver);
  }
}

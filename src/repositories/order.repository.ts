import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, Dish, Order, OrderDishes, OrderRelations} from '../models';
import {Employee} from './../models/employee.model';
import {CustomerRepository} from './customer.repository';
import {DishRepository} from './dish.repository';
import {EmployeeRepository} from './employee.repository';
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

  public readonly employee: HasOneRepositoryFactory<
    Employee,
    typeof Employee.prototype.id
  >;
  public readonly customer: HasOneRepositoryFactory<
    Customer,
    typeof Customer.prototype.id
  >;

  public readonly orderDishes: HasManyRepositoryFactory<
    OrderDishes,
    typeof OrderDishes.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('OrderDishesRepository')
    protected orderDishesRepositoryGetter: Getter<OrderDishesRepository>,
    @repository.getter('DishRepository')
    protected dishRepositoryGetter: Getter<DishRepository>,
    @repository.getter('EmployeeRepository')
    protected employeeRepositoryGetter: Getter<EmployeeRepository>,
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

    this.orderDishes = this.createHasManyRepositoryFactoryFor(
      'orderDishes',
      orderDishesRepositoryGetter,
    );

    this.registerInclusionResolver(
      'orderDishes',
      this.orderDishes.inclusionResolver,
    );

    this.employee = this.createHasOneRepositoryFactoryFor(
      'employee',
      employeeRepositoryGetter,
    );
    this.registerInclusionResolver('employee', this.employee.inclusionResolver);

    this.customer = this.createHasOneRepositoryFactoryFor(
      'customer',
      customerRepositoryGetter,
    );
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer, CustomerRelations, Order} from '../models';
import {OrderRepository} from './order.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Customer.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Customer, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }
}

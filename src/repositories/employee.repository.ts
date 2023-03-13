import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Employee, EmployeeRelations, Order, User} from '../models';
import {OrderRepository} from './order.repository';
import {UserRepository} from './user.repository';

export class EmployeeRepository extends DefaultCrudRepository<
  Employee,
  typeof Employee.prototype.id,
  EmployeeRelations
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Employee.prototype.id
  >;

  public readonly user: BelongsToAccessor<User, typeof Employee.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Employee, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);

    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }
}

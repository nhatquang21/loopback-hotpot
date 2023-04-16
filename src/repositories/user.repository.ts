import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import moment from 'moment';
import {DbDataSource} from '../datasources';
import {Role, User, UserRelations} from '../models';
import {RoleRepository} from './role.repository';
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  bcrypt = require('bcrypt');
  saltRounds = 10;

  public readonly role: HasOneRepositoryFactory<Role, typeof Role.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(User, dataSource);
    this.role = this.createHasOneRepositoryFactoryFor(
      'role',
      roleRepositoryGetter,
    );
    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }

  async createFromEmployee(user: User) {
    user.pwd = await this.bcrypt.hash(user.pwd, this.saltRounds);
    user.createdOn = moment().toISOString();
    user.roleId = 2;
    try {
      const checkUniqueUser = await this.find({
        where: {username: user.username},
      });
      if (checkUniqueUser.length == 0) {
        return this.create(user);
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }
}

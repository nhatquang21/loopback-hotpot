import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import moment from 'moment';
import {DbDataSource} from '../datasources';
import {User, UserRelations} from '../models';
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  bcrypt = require('bcrypt');
  saltRounds = 10;
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(User, dataSource);
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

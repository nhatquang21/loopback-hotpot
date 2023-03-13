import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Employee,
  User,
} from '../models';
import {EmployeeRepository} from '../repositories';

export class EmployeeUserController {
  constructor(
    @repository(EmployeeRepository)
    public employeeRepository: EmployeeRepository,
  ) { }

  @get('/employees/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Employee',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Employee.prototype.id,
  ): Promise<User> {
    return this.employeeRepository.user(id);
  }
}

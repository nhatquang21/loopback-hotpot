import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Employee, EmployeeRequest, User} from '../models';
import {EmployeeRepository} from '../repositories';
import {UserRepository} from './../repositories/user.repository';

// @authenticate('jwt')
export class EmployeeController {
  bcrypt = require('bcrypt');
  saltRounds = 10;
  constructor(
    @repository(EmployeeRepository)
    public employeeRepository: EmployeeRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/employees')
  @response(200, {
    description: 'Employee model instance',
    content: {'application/json': {schema: getModelSchemaRef(Employee)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmployeeRequest, {
            title: 'NewEmployee',
            exclude: ['id'],
          }),
        },
      },
    })
    req: Omit<EmployeeRequest, 'id'>,
  ): Promise<any> {
    //  console.log(req);
    const {user, ...employee} = req;

    const newUser = await this.userRepository.createFromEmployee(user);

    if (newUser) {
      if (newUser.id != undefined) {
        employee.userId = newUser.id;

        try {
          const addEmp = await this.employeeRepository.create(employee);
          return addEmp;
        } catch (e) {
          const deleteUser = this.userRepository.delete(newUser);
          return 'add new employee failed';
        }
      }
    } else {
      return `User existed`;
    }
  }

  @get('/employees/count')
  @response(200, {
    description: 'Employee model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Employee) where?: Where<Employee>): Promise<Count> {
    return this.employeeRepository.count(where);
  }

  @get('/employees')
  @response(200, {
    description: 'Array of Employee model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Employee, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Employee) filter?: Filter<Employee>,
  ): Promise<Employee[]> {
    return this.employeeRepository.find(filter);
  }

  // @patch('/employees')
  // @response(200, {
  //   description: 'Employee PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Employee, {partial: true}),
  //       },
  //     },
  //   })
  //   employee: Employee,
  //   @param.where(Employee) where?: Where<Employee>,
  // ): Promise<Count> {
  //   return this.employeeRepository.updateAll(employee, where);
  // }

  @get('/employees/{id}')
  @response(200, {
    description: 'Employee model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Employee, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Employee, {exclude: 'where'})
    filter?: FilterExcludingWhere<Employee>,
  ): Promise<Employee> {
    return this.employeeRepository.findById(id, filter);
  }

  @patch('/employees/{id}')
  @response(204, {
    description: 'Employee PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Employee, {partial: true}),
        },
      },
    })
    employee: Employee,
  ): Promise<void> {
    await this.employeeRepository.updateById(id, employee);
  }

  @put('/employees/{id}')
  @response(204, {
    description: 'Employee PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() employee: Employee,
  ): Promise<void> {
    await this.employeeRepository.replaceById(id, employee);
  }

  @del('/employees/{id}')
  @response(204, {
    description: 'Employee DELETE success',
  })
  async deleteById(
    @param.path.number('id') id: number,
  ): Promise<string | void> {
    console.log(`[deleteById] req: ${id}`);
    try {
      console.log(`[findById Employee] req: ${id}`);
      let employee: Employee = await this.employeeRepository.findById(id);

      if (employee) {
        console.log(`[findById User] req: ${employee.userId}`);
        let user: User = await this.userRepository.findById(employee.userId);

        if (user) {
          console.log(`[deleteById Employee] req: ${id}`);
          await this.employeeRepository.deleteById(id);
          console.log(`[findById User] req: ${user.id}`);
          await this.userRepository.deleteById(user.id);
        } else {
          return `User with id ${employee.id} doesn't exist`;
        }
      }
    } catch (e) {
      return `Failed to find employee with id ${id} !`;
    }
  }
}

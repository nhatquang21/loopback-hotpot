import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {Order} from './order.model';
import {User} from './user.model';

@model({
  settings: {
    postgresql: {table: 'employees'}, // custom names
  },
})
export class Employee extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'employee_id',
      dataType: 'integer',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'employee_name',
      datatyPe: 'character varying',
    },
  })
  name: string;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'employee_status',
      datatype: 'boolean',
    },
  })
  status: boolean;
  @hasMany(() => Order)
  orders: Order[];

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;

  constructor(data?: Partial<Employee>) {
    super(data);
  }
}

export interface EmployeeRelations {
  // describe navigational properties here
}

export type EmployeeWithRelations = Employee & EmployeeRelations;
@model()
export class UserRequest {
  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'user_name',
      datatype: 'character varying',
    },
    index: {
      unique: true,
    },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'password',
      datatype: 'character varying',
    },
    jsonSchema: {
      maxLength: 16,
      minLength: 4,
    },
  })
  pwd: string;
}
@model()
export class EmployeeRequest extends Employee {
  @property({
    type: 'object',
    itemType: User,
  })
  user: User;
}

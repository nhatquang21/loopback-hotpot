import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
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

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'user_id',
      datatype: 'integer',
    },
  })
  userId: number;

  @hasMany(() => Order)
  orders: Order[];

  @hasOne(() => User)
  user: User;

  constructor(data?: Partial<Employee>) {
    super(data);
  }
}

export interface EmployeeRelations {
  // describe navigational properties here
}

export type EmployeeWithRelations = Employee & EmployeeRelations;

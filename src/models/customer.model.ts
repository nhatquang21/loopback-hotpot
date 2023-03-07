import {Entity, hasMany, model, property} from '@loopback/repository';
import {Order} from './order.model';

@model({
  settings: {
    postgresql: {table: 'customers'}, // custom names
  },
})
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'customer_id',
      dataType: 'integer',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'customer_name',
      dataType: 'character varying',
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'customer_address',
      dataType: 'character varying',
    },
  })
  address: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'phone_number',
      dataType: 'character varying',
    },
  })
  phoneNumber?: string;

  @hasMany(() => Order, {keyTo: 'customerId'})
  orders: Order[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;

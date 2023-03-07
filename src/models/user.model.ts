import {Entity, hasOne, model, property} from '@loopback/repository';
import {Role} from './role.model';

@model({
  settings: {
    postgresql: {table: 'users'}, // custom names
  },
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'user_id',
      datatype: 'integer',
    },
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'user_name',
      datatype: 'character varying',
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
  })
  pwd: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'created_on',
      datatype: 'Timestamp with timezone',
    },
  })
  createdOn?: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'updated_on',
      datatype: 'Timestamp with timezone',
    },
  })
  updatedOn?: string;

  @hasOne(() => Role)
  role: Role;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;

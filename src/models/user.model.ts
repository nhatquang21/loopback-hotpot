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
  id: number;

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

  @hasOne(() => Role, {
    keyFrom: 'roleId',
    keyTo: 'id',
  })
  role: Role;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'role_id',
      datatype: 'integer',
    },
  })
  roleId?: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export class UserChangePwdRequest extends User {
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
  newPwd: string;
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;

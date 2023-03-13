import {Entity, model, property, hasMany} from '@loopback/repository';
import {User} from './user.model';

@model({
  settings: {
    postgresql: {table: 'roles'}, // custom names
  },
})
export class Role extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'role_id',
      dataType: 'integer',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'role_name',
      dataType: 'character varying',
    },
  })
  name: string;

  @hasMany(() => User)
  users: User[];

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;

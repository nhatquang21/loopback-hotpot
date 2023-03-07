import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {table: 'dishes'}, // custom names
  },
})
export class Dish extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'dish_id',
      dataType: 'integer',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'dish_name',
      dataType: 'CHARACTER VARYING',
      dataLength: 50,
    },
  })
  name: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'dish_price',
      dataType: 'integer',
    },
  })
  price: number;

  constructor(data?: Partial<Dish>) {
    super(data);
  }
}

export interface DishRelations {
  // describe navigational properties here
}

export type DishWithRelations = Dish & DishRelations;

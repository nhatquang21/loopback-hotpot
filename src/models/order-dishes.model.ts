import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: {table: 'order_dishes'}, // custom names
  },
})
export class OrderDishes extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'integer',
    },
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'order_id',
      dataType: 'integer',
    },
  })
  orderId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'dish_id',
      dataType: 'integer',
    },
  })
  dishId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'dish_quantity',
      dataType: 'integer',
    },
  })
  dishQuantity: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'dish_totalprice',
      dataType: 'integer',
    },
  })
  dishTotalPrice: number;

  constructor(data?: Partial<OrderDishes>) {
    super(data);
  }
}

export interface OrderDishesRelations {
  // describe navigational properties here
}

export type OrderDishesWithRelations = OrderDishes & OrderDishesRelations;

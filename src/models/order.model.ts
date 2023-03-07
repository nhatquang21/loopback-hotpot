import {Entity, hasMany, model, property} from '@loopback/repository';
import {Dish} from './dish.model';
import {OrderDishes} from './order-dishes.model';

@model({
  settings: {
    postgresql: {table: 'orders'}, // custom names
  },
})
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'order_id',
      dataType: 'integer',
    },
  })
  id: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'total_bill',
      dataType: 'integer',
    },
  })
  totalBill: number;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'created_on',
      dataType: 'TIMESTAMP WITH TIME ZONE',
    },
  })
  createdOn: string;

  @hasMany(() => Dish, {through: {model: () => OrderDishes}})
  dishes: Dish[];

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;

@model()
export class DishWithQuantityRequest extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  dishId: number;

  @property({
    type: 'number',
    required: true,
  })
  quantity: number;

  constructor(data?: Partial<DishWithQuantityRequest>) {
    super(data);
  }
}
@model()
export class OrderRequest extends Order {
  @property({
    type: 'array',
    itemType: DishWithQuantityRequest,
    required: true,
  })
  dishList: DishWithQuantityRequest[];

  constructor(data?: Partial<OrderRequest>) {
    super(data);
  }
}

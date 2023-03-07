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
import moment from 'moment';
import {Dish, OrderRequest} from '../models';
import {Order} from './../models/order.model';
import {DishRepository} from './../repositories/dish.repository';
import {OrderDishesRepository} from './../repositories/order-dishes.repository';
import {OrderRepository} from './../repositories/order.repository';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(OrderDishesRepository)
    public orderDishesRepository: OrderDishesRepository,
    @repository(DishRepository)
    public DishRepository: DishRepository,
  ) {}

  @post('/orders')
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderRequest, {
            title: 'NewOrder',
            exclude: ['id'],
          }),
        },
      },
    })
    req: Omit<OrderRequest, 'id'>,
    // req: Omit<OrderRequest, 'id'>,
  ): Promise<Order> {
    const {dishList, ...order} = req;

    let totalBill = 0;
    for (let item of dishList) {
      const dish: Dish = await this.DishRepository.findById(item.dishId);
      totalBill += dish.price * item.quantity;
    }
    order.createdOn = moment().toISOString();
    order.totalBill = totalBill;

    const newOrder = await this.orderRepository.create(order);
    for (let item of dishList) {
      const dish: Dish = await this.DishRepository.findById(item.dishId);
      this.orderDishesRepository.create({
        orderId: newOrder.id,
        dishId: item.dishId,
        dishQuantity: item.quantity,
        dishTotalPrice: dish.price * item.quantity,
      });
    }

    return newOrder;
  }

  @get('/orders/count')
  @response(200, {
    description: 'Order model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @get('/orders')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    return this.orderRepository.find(filter);
  }

  @patch('/orders')
  @response(200, {
    description: 'Order PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
    @param.where(Order) where?: Where<Order>,
  ): Promise<Count> {
    return this.orderRepository.updateAll(order, where);
  }

  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Order, {exclude: 'where'})
    filter?: FilterExcludingWhere<Order>,
  ): Promise<Order> {
    return this.orderRepository.findById(id, filter);
  }

  @patch('/orders/{id}')
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderRequest, {partial: true}),
        },
      },
    })
    req: OrderRequest,
  ): Promise<Order> {
    const deleteOrders = await this.deleteById(id);

    const {dishList, ...order} = req;

    let totalBill = 0;
    for (let item of dishList) {
      const dish: Dish = await this.DishRepository.findById(item.dishId);
      totalBill += dish.price * item.quantity;
    }
    order.createdOn = moment().toISOString();
    order.totalBill = totalBill;

    const newOrder = await this.orderRepository.create(order);
    for (let item of dishList) {
      const dish: Dish = await this.DishRepository.findById(item.dishId);
      this.orderDishesRepository.create({
        orderId: newOrder.id,
        dishId: item.dishId,
        dishQuantity: item.quantity,
        dishTotalPrice: dish.price * item.quantity,
      });
    }

    return newOrder;
  }

  @put('/orders/{id}')
  @response(204, {
    description: 'Order PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const mappings = await this.orderDishesRepository.find({
      where: {orderId: id},
    });

    if (mappings) {
      for (const mapping of mappings) {
        await this.orderDishesRepository.deleteById(mapping.id);
      }
    }
    await this.orderRepository.deleteById(id);
  }
}

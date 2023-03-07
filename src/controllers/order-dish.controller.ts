import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Dish, Order} from '../models';
import {OrderDishesRepository, OrderRepository} from '../repositories';

export class OrderDishController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
    @repository(OrderDishesRepository)
    public orderDishesRepository: OrderDishesRepository,
  ) {}

  @get('/orders/{id}/dishes', {
    responses: {
      '200': {
        description: 'Array of Order has many Dish through OrderDishes',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Dish)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Dish>,
  ): Promise<Dish[]> {
    return this.orderRepository.dishes(id).find(filter);
  }

  @post('/orders/{id}/dishes', {
    responses: {
      '200': {
        description: 'create a Dish model instance',
        content: {'application/json': {schema: getModelSchemaRef(Dish)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Order.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {
            title: 'NewDishInOrder',
            exclude: ['id'],
          }),
        },
      },
    })
    dish: Omit<Dish, 'id'>,
  ): Promise<Dish> {
    return this.orderRepository.dishes(id).create(dish);
  }

  @patch('/orders/{id}/dishes', {
    responses: {
      '200': {
        description: 'Order.Dish PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {partial: true}),
        },
      },
    })
    dish: Partial<Dish>,
    @param.query.object('where', getWhereSchemaFor(Dish)) where?: Where<Dish>,
  ): Promise<Count> {
    return this.orderRepository.dishes(id).patch(dish, where);
  }

  @del('/orders/{id}/dishes', {
    responses: {
      '200': {
        description: 'Order.Dish DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Dish)) where?: Where<Dish>,
  ): Promise<Count> {
    return this.orderRepository.dishes(id).delete(where);
  }
}

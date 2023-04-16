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
import {OrderDishes} from '../models';
import {OrderDishesRepository} from '../repositories';

// @authenticate('jwt')
export class OrderDishesController {
  constructor(
    @repository(OrderDishesRepository)
    public orderDishesRepository: OrderDishesRepository,
  ) {}

  @post('/order-dishes')
  @response(200, {
    description: 'OrderDishes model instance',
    content: {'application/json': {schema: getModelSchemaRef(OrderDishes)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderDishes, {
            title: 'NewOrderDishes',
            exclude: ['id'],
          }),
        },
      },
    })
    orderDishes: Omit<OrderDishes, 'id'>,
  ): Promise<OrderDishes> {
    return this.orderDishesRepository.create(orderDishes);
  }

  @get('/order-dishes/count')
  @response(200, {
    description: 'OrderDishes model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(OrderDishes) where?: Where<OrderDishes>,
  ): Promise<Count> {
    return this.orderDishesRepository.count(where);
  }

  @get('/order-dishes')
  @response(200, {
    description: 'Array of OrderDishes model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OrderDishes, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(OrderDishes) filter?: Filter<OrderDishes>,
  ): Promise<OrderDishes[]> {
    return this.orderDishesRepository.find(filter);
  }

  @patch('/order-dishes')
  @response(200, {
    description: 'OrderDishes PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderDishes, {partial: true}),
        },
      },
    })
    orderDishes: OrderDishes,
    @param.where(OrderDishes) where?: Where<OrderDishes>,
  ): Promise<Count> {
    return this.orderDishesRepository.updateAll(orderDishes, where);
  }

  @get('/order-dishes/{id}')
  @response(200, {
    description: 'OrderDishes model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(OrderDishes, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(OrderDishes, {exclude: 'where'})
    filter?: FilterExcludingWhere<OrderDishes>,
  ): Promise<OrderDishes> {
    return this.orderDishesRepository.findById(id, filter);
  }

  @patch('/order-dishes/{id}')
  @response(204, {
    description: 'OrderDishes PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderDishes, {partial: true}),
        },
      },
    })
    orderDishes: OrderDishes,
  ): Promise<void> {
    await this.orderDishesRepository.updateById(id, orderDishes);
  }

  @put('/order-dishes/{id}')
  @response(204, {
    description: 'OrderDishes PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() orderDishes: OrderDishes,
  ): Promise<void> {
    await this.orderDishesRepository.replaceById(id, orderDishes);
  }

  @del('/order-dishes/{id}')
  @response(204, {
    description: 'OrderDishes DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderDishesRepository.deleteById(id);
  }
}

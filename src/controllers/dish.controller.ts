import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Dish} from '../models';
import {DishRepository} from '../repositories';

export class DishController {
  constructor(
    @repository(DishRepository)
    public dishRepository : DishRepository,
  ) {}

  @post('/dishes')
  @response(200, {
    description: 'Dish model instance',
    content: {'application/json': {schema: getModelSchemaRef(Dish)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {
            title: 'NewDish',
            exclude: ['id'],
          }),
        },
      },
    })
    dish: Omit<Dish, 'id'>,
  ): Promise<Dish> {
    return this.dishRepository.create(dish);
  }

  @get('/dishes/count')
  @response(200, {
    description: 'Dish model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Dish) where?: Where<Dish>,
  ): Promise<Count> {
    return this.dishRepository.count(where);
  }

  @get('/dishes')
  @response(200, {
    description: 'Array of Dish model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Dish, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Dish) filter?: Filter<Dish>,
  ): Promise<Dish[]> {
    return this.dishRepository.find(filter);
  }

  @patch('/dishes')
  @response(200, {
    description: 'Dish PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {partial: true}),
        },
      },
    })
    dish: Dish,
    @param.where(Dish) where?: Where<Dish>,
  ): Promise<Count> {
    return this.dishRepository.updateAll(dish, where);
  }

  @get('/dishes/{id}')
  @response(200, {
    description: 'Dish model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Dish, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Dish, {exclude: 'where'}) filter?: FilterExcludingWhere<Dish>
  ): Promise<Dish> {
    return this.dishRepository.findById(id, filter);
  }

  @patch('/dishes/{id}')
  @response(204, {
    description: 'Dish PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dish, {partial: true}),
        },
      },
    })
    dish: Dish,
  ): Promise<void> {
    await this.dishRepository.updateById(id, dish);
  }

  @put('/dishes/{id}')
  @response(204, {
    description: 'Dish PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() dish: Dish,
  ): Promise<void> {
    await this.dishRepository.replaceById(id, dish);
  }

  @del('/dishes/{id}')
  @response(204, {
    description: 'Dish DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.dishRepository.deleteById(id);
  }
}

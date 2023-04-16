import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
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
  requestBody,
  response,
} from '@loopback/rest';
import {Dish} from '../models';
import {DishRepository} from './../repositories/dish.repository';
import {OrderDishesRepository} from './../repositories/order-dishes.repository';

export class DishController {
  constructor(
    @repository(DishRepository)
    public dishRepository: DishRepository,
    @repository(OrderDishesRepository)
    public orderDishesRepository: OrderDishesRepository,
  ) {}

  @post('/dishes')
  @response(200, {
    description: 'Dish model instance',
    content: {'application/json': {schema: getModelSchemaRef(Dish)}},
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['ADMIN', 'Employees'],
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
  async count(@param.where(Dish) where?: Where<Dish>): Promise<Count> {
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
  async find(@param.filter(Dish) filter?: Filter<Dish>): Promise<Dish[]> {
    return this.dishRepository.find(filter);
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
    @param.filter(Dish, {exclude: 'where'}) filter?: FilterExcludingWhere<Dish>,
  ): Promise<Dish> {
    return this.dishRepository.findById(id, filter);
  }

  @patch('/dishes/{id}')
  @response(204, {
    description: 'Dish PATCH success',
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['ADMIN', 'Employees'],
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

  // @authenticate('jwt')
  // @put('/dishes/{id}')
  // @response(204, {
  //   description: 'Dish PUT success',
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() dish: Dish,
  // ): Promise<void> {
  //   await this.dishRepository.replaceById(id, dish);
  // }

  @del('/dishes/{id}')
  @response(204, {
    description: 'Dish DELETE success',
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['ADMIN', 'Employees'],
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.dishRepository.deleteById(id);
  }

  @get('/dishes/features/getBestSellingDish')
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
  async findBestSellingDish(
    @param.query.string('startDate') startDate: string,
    @param.query.string('endDate') endDate: string,
  ): Promise<object | string> {
    if (startDate != null && endDate != null) {
      const query: any = await this.dishRepository.execute(
        `Select M.dish_id, sum(M.dish_quantity) as quantity from orders O
         inner join order_dishes M on O.order_id = M.order_id
        where created_on >= ${startDate} and created_on <= ${endDate}
         group by M.dish_id
         order by quantity desc
         limit 1;`,
      );
      if (query[0]) {
        const dishId: number = query[0].dish_id;

        const dish: Dish = await this.dishRepository.findById(dishId);
        let result: object = {
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          totalQuantity: parseInt(query[0].quantity),
        };
        return result;
      } else {
        return [];
      }
    } else {
      return `query params are not valid`;
    }
  }

  @get('/dishes/features/topThreeDishes')
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
  async findTopThreeDishes(
    @param.query.string('startDate') startDate: string,
    @param.query.string('endDate') endDate: string,
  ): Promise<Array<any> | string> {
    try {
      const query: any = await this.dishRepository.execute(
        `Select M.dish_id, sum(M.dish_quantity) as quantity from orders O
         inner join order_dishes M on O.order_id = M.order_id
        where created_on >= ${startDate} and created_on <= ${endDate}
         group by M.dish_id
         order by quantity desc
         limit 3;`,
      );

      if (query[0]) {
        let arr = [];
        for (let item of query) {
          const dish: Dish = await this.dishRepository.findById(item.dish_id);
          let result: object = {
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            totalQuantity: parseInt(item.quantity),
          };
          arr.push(result);
        }

        return arr;
      } else {
        return [];
      }
    } catch (e: any) {
      return `Either start date or end date is not valid`;
    }
  }
}

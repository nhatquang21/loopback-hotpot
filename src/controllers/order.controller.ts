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
import {Order} from '../models/order.model';
import {CustomerRepository} from '../repositories/customer.repository';
import {DishRepository} from '../repositories/dish.repository';
import {OrderDishesRepository} from '../repositories/order-dishes.repository';
import {OrderRepository} from '../repositories/order.repository';
import {EmployeeRepository} from './../repositories/employee.repository';
export class OrderController {
  CustomerRepository: any;
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(OrderDishesRepository)
    public orderDishesRepository: OrderDishesRepository,
    @repository(DishRepository)
    public dishRepository: DishRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @repository(EmployeeRepository)
    public employeeRepository: EmployeeRepository,
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
    const checkOrder = await this.customerRepository.findById(order.customerId);
    const checkEmp = await this.employeeRepository.findById(order.employeeId);
    let totalBill = 0;
    for (let item of dishList) {
      const dish: Dish = await this.dishRepository.findById(item.dishId);
      totalBill += dish.price * item.quantity;
    }
    order.createdOn = moment().toISOString();
    order.totalBill = totalBill;

    const newOrder = await this.orderRepository.create(order);
    for (let item of dishList) {
      const dish: Dish = await this.dishRepository.findById(item.dishId);
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
  ): Promise<any> {
    const {dishList, ...order} = req;
    const checkCustomer = await this.customerRepository.findById(
      order.customerId,
    );
    const checkEmp = await this.employeeRepository.findById(order.employeeId);
    let totalBill = 0;
    for (let item of dishList) {
      const dish: Dish = await this.dishRepository.findById(item.dishId);
      totalBill += dish.price * item.quantity;
    }
    const deleteOrders = await this.deleteById(id);
    order.createdOn = moment().toISOString();
    order.totalBill = totalBill;

    const newOrder = await this.orderRepository.create(order);
    for (let item of dishList) {
      const dish: Dish = await this.dishRepository.findById(item.dishId);
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

  @get('/orders/features/countOrder')
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
  async countOrder(
    @param.query.string('date') date: string,
  ): Promise<number | string> {
    if (date) {
      let startOfDate = date + ' 00:00:00';
      let endOfDate = date + ' 23:59:59';
      let query = await this.orderRepository.execute(`
      SELECT count(order_id) as count
      from Orders
      where created_on >= '${startOfDate}' and created_on <= '${endOfDate}'
      `);
      return query[0].count;
    } else {
      return `Query param is not valid`;
    }
  }

  @get('/orders/features/getProfitOneDay')
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
  async findProfitOneDay(
    @param.query.string('date') date: string,
  ): Promise<number | string> {
    if (date) {
      let startOfDate = date + ' 00:00:00';
      let endOfDate = date + ' 23:59:59';
      let checkDateHaveOrders = await this.orderRepository.execute(`
      SELECT * from orders where  created_on >= '${startOfDate}' and created_on <= '${endOfDate}'
      `);
      if (checkDateHaveOrders.length > 0) {
        let query = await this.orderRepository.execute(`
        SELECT sum(total_bill) as profit
        from Orders
        where created_on >= '${startOfDate}' and created_on <= '${endOfDate}'

        `);

        return query[0].profit;
      } else {
        return `No orders in ${date}`;
      }
    } else {
      return `Query param is not valid`;
    }
  }

  @get('/orders/features/mostvaluableorder')
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
  async findMostValuableOrder(
    @param.query.string('date') date: string,
  ): Promise<number | string> {
    if (date) {
      let startOfDate = date + ' 00:00:00';
      let endOfDate = date + ' 23:59:59';
      let checkDateHaveOrders = await this.orderRepository.execute(`
      SELECT * from orders where  created_on >= '${startOfDate}' and created_on <= '${endOfDate}'
      `);
      if (checkDateHaveOrders.length > 0) {
        let query = await this.orderRepository.execute(`
        SELECT O.order_id, O.total_bill, sum(dish_quantity)
        FROM Orders O join order_dishes M ON O.order_id = M.order_id
        where O.created_on >= '${startOfDate}' and O.created_on <= '${endOfDate}'
        group by O.order_id
        order by  O.total_bill desc
        limit 1;


        `);

        return query[0];
      } else {
        return `No orders in ${date}`;
      }
    } else {
      return `Query param is not valid`;
    }
  }

  @get('/orders/features/getProfitBetweenDate')
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
  async findProfitBetweenDate(
    @param.query.string('startDate') startDate: string,
    @param.query.string('endDate') endDate: string,
  ): Promise<any[] | string> {
    if (startDate != null && endDate != null) {
      let startOfDate = startDate + ' 00:00:00';
      let endOfDate = endDate + ' 23:59:59';
      console.log('checkHaveOrders in findprofitbetweendate');
      console.log(startOfDate);
      console.log(endOfDate);
      let checkDateHaveOrders = await this.orderRepository.execute(`
      SELECT * from orders where created_on >= '${startOfDate}' and created_on <= '${endOfDate}'
      `);
      if (checkDateHaveOrders.length > 0) {
        console.log('query in findprofitbetweendate');
        let query: any = await this.orderRepository.execute(`
        SELECT to_char(orders.created_on, 'DD/MM/YYYY') as Date, sum(orders.total_bill) as profit
        from orders
        where orders.created_on >= '${startOfDate}'  and orders.created_on <= '${endOfDate}'
        group by Date;
        `);

        return query;
      } else {
        return `No orders between ${startDate} and ${endDate}`;
      }
    } else {
      return `Query param is not valid`;
    }
  }
}

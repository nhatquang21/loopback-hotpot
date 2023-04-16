import {UserChangePwdRequest} from './../models/user.model';
import {RoleRepository} from './../repositories/role.repository';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {authenticate} from '@loopback/authentication/dist/decorators/authenticate.decorator';
import {authorize} from '@loopback/authorization';
import {Getter, inject} from '@loopback/core';
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
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import moment from 'moment';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {basicAuthorization} from '../services/author.service';
import {CustomJWTService, MyUserProfile} from './../services/jwt.service';
import {Credentials, CustomUserService} from './../services/user.service';
// @model()
// export class NewUserRequest extends User {
//   @property({
//     type: 'string',
//     required: true,
//   })
//   password: string;
// }

type ResponseUser = {
  id?: number;
  username?: string;
  role?: string;
  createdOn?: any;
  token: string;
};

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 4,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

@authenticate('jwt')
export class UserController {
  bcrypt = require('bcrypt');
  saltRounds = 10;

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: CustomJWTService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: CustomUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: MyUserProfile,
    @inject.getter(SecurityBindings.USER, {optional: true})
    private readonly getCurrentUser: Getter<UserProfile>,

    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(RoleRepository) protected roleRepository: RoleRepository,
  ) {}

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  // @authorize({allowedRoles: ['ADMIN']})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<any> {
    user.pwd = await this.bcrypt.hash(user.pwd, this.saltRounds);
    user.createdOn = moment().toISOString();

    const checkUniqueUser = await this.find({
      where: {username: user.username},
    });

    if (checkUniqueUser.length == 0) {
      const savedUser = await this.userRepository.create(user);
      return savedUser;
    } else if (checkUniqueUser.length > 0) {
      throw new HttpErrors[400]('User already exists');
    }
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  // @authorize({allowedRoles: ['ADMIN']})
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  @authorize({
    allowedRoles: ['ADMIN', 'Employees'],
    voters: [basicAuthorization],
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  @authorize({
    allowedRoles: ['ADMIN'],
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    if (user.pwd) {
      user.pwd = await this.bcrypt.hash(user.pwd, this.saltRounds);
    }
    console.log(user);

    await this.userRepository.updateById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  // @authenticate('jwt')
  // @authorize({
  //   allowedRoles: ['ADMIN'],
  // })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  @authenticate.skip()
  @authorize.skip()
  async signIn(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<ResponseUser> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    // console.log(userProfile);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    console.log(userProfile);
    let role = await this.roleRepository.findById(userProfile.roleId!);

    return {
      id: userProfile.id,
      username: userProfile.username,
      role: role.name,
      createdOn: userProfile.createdOn,
      token: token,
    };
  }

  // @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: MyUserProfile,
  ) {
    console.log('CURRENT USER: ', currentUserProfile);
    return currentUserProfile;
  }

  @patch('/changePWD')
  @response(204, {
    description: 'User PATCH success',
  })
  @authenticate('jwt')
  async changePasswordById(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserChangePwdRequest, {partial: true}),
        },
      },
    })
    user: UserChangePwdRequest,
  ): Promise<void> {
    const currentUser = await this.getCurrentUser();
    console.log(currentUser);

    if (!currentUser) {
      throw new HttpErrors[401]('User not found');
    }
    this.userService.ChangePassword(currentUser.user_id, user.pwd, user.newPwd);
  }
}
